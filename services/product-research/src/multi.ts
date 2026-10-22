import type { Candidate, ProductClues } from '@ai-product-agent/types';
import { createResearchQuery, ResearchProviderError, type ResearchProvider } from './index.ts';
import { deduplicateCandidates } from './dedupe.ts';

export type ResearchProviderRunState = 'success' | 'empty' | 'failed' | 'not_configured';

export interface ResearchProviderRun {
  name: string;
  status: ResearchProviderRunState;
  candidateCount: number;
  error?: string;
}

export interface ResearchRun {
  status: 'completed' | 'no_matches' | 'partial_success';
  providers: ResearchProviderRun[];
}

export class MultiProviderResearchService {
  private readonly providers: ResearchProvider[];
  lastRun?: ResearchRun;

  constructor(providers: ResearchProvider[]) {
    this.providers = providers;
  }

  async search(clues: ProductClues): Promise<Candidate[]> {
    const queries = createResearchQuery(clues);
    const searchQueries: Array<string | undefined> = queries.length ? queries : [undefined];
    const tasks = this.providers.flatMap((provider) =>
      searchQueries.map((query) => ({ provider, query }))
    );
    const settled = await Promise.allSettled(
      tasks.map((task) => task.provider.search(clues, task.query))
    );
    const grouped = new Map<string, ResearchProviderRun>();
    const all: Candidate[] = [];
    let hadFailure = false;

    settled.forEach((result, index) => {
      const { provider, query } = tasks[index];
      const current = grouped.get(provider.name) ?? {
        name: provider.name,
        status: 'empty' as const,
        candidateCount: 0
      };
      grouped.set(provider.name, current);

      if (result.status === 'fulfilled') {
        current.candidateCount += result.value.length;
        if (result.value.length) current.status = 'success';
        all.push(
          ...result.value.map((candidate) => ({
            ...candidate,
            provider: candidate.provider ?? provider.name,
            providerMetadata: {
              ...candidate.providerMetadata,
              providerKind: provider.kind ?? 'public-api'
            },
            matchingSignals: query
              ? [...candidate.matchingSignals, `Query variant: ${query}`]
              : candidate.matchingSignals
          }))
        );
        return;
      }

      hadFailure = true;
      const reason = result.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const queryLabel = query ? ` query=${query}` : '';
      console.error(`[research] provider=${provider.name}${queryLabel} failed: ${message}`);
      if (current.status !== 'success') {
        current.status =
          (reason as { code?: string } | undefined)?.code === 'RESEARCH_PROVIDER_NOT_CONFIGURED' ||
          provider.status === 'not-configured'
            ? 'not_configured'
            : 'failed';
      }
      current.error = message;
    });

    const runs = [...grouped.values()];
    const successful = runs.some((run) => run.status === 'success' || run.status === 'empty');
    const failed =
      runs.some((run) => run.status === 'failed' || run.status === 'not_configured') || hadFailure;
    const status: ResearchRun['status'] =
      successful && failed
        ? 'partial_success'
        : runs.some((run) => run.status === 'success')
          ? 'completed'
          : 'no_matches';
    this.lastRun = { status, providers: runs };

    if (tasks.length > 0 && settled.every((result) => result.status === 'rejected')) {
      const notConfigured = this.providers.some((provider) => provider.status === 'not-configured');
      throw new ResearchProviderError(
        notConfigured ? 'RESEARCH_PROVIDER_NOT_CONFIGURED' : 'RESEARCH_PROVIDER_UNAVAILABLE',
        notConfigured
          ? 'No research provider is configured for this environment.'
          : 'All configured research providers are unavailable.'
      );
    }

    return deduplicateCandidates(all);
  }
}
