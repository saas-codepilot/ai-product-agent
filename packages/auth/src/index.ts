// The API package supplies Node types; keeping this port runtime-only also lets browser-independent contract checks compile it.
// @ts-ignore Node runtime module
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
declare const Buffer:any;
export interface AuthenticatedSession { id:string; userId:string; workspaceId:string; role:'owner'|'member'; expiresAt:number; }
export class SessionService { private users=new Map<string,{id:string;email:string;hash:string;salt:string;workspaceId:string;role:'owner'|'member'}>(); private sessions=new Map<string,AuthenticatedSession>(); private ttlMs:number; constructor(ttlMs=86400000){this.ttlMs=ttlMs;}
 register(email:string,password:string,workspaceId:string){if(password.length<12)throw new Error('Password must be at least 12 characters.');const normalized=email.trim().toLowerCase();if(this.users.has(normalized))throw new Error('Account already exists.');const salt=randomBytes(16).toString('hex');const hash=scryptSync(password,salt,64).toString('hex');const user={id:randomBytes(12).toString('hex'),email:normalized,hash,salt,workspaceId,role:'owner' as const};this.users.set(normalized,user);return {id:user.id,email:user.email,workspaceId:user.workspaceId};}
 login(email:string,password:string){const u=this.users.get(email.trim().toLowerCase());if(!u)throw new Error('Invalid credentials.');const actual=Buffer.from(scryptSync(password,u.salt,64).toString('hex'),'hex'),expected=Buffer.from(u.hash,'hex');if(actual.length!==expected.length||!timingSafeEqual(actual,expected))throw new Error('Invalid credentials.');const session:AuthenticatedSession={id:randomBytes(32).toString('hex'),userId:u.id,workspaceId:u.workspaceId,role:u.role,expiresAt:Date.now()+this.ttlMs};this.sessions.set(session.id,session);return session;}
 get(id:string|undefined){if(!id)return undefined;const s=this.sessions.get(id);if(!s||s.expiresAt<Date.now()){if(s)this.sessions.delete(id);return undefined;}return s;}
 logout(id:string|undefined){if(id)this.sessions.delete(id);}
}
export function sessionCookie(id:string,maxAge=86400){return `sid=${encodeURIComponent(id)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`;}
