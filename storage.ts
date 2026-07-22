import { StoredResult } from "./types.js";
const KEY="healthmetric-history"; export function storageEnabled():boolean{return localStorage.getItem("healthmetric-storage")==="yes";}
export function setStorageEnabled(on:boolean):void{localStorage.setItem("healthmetric-storage",on?"yes":"no");if(!on)localStorage.removeItem(KEY);}
export function saveResult(result:StoredResult):StoredResult[]{if(!storageEnabled())return loadResultHistory();const list=[result,...loadResultHistory()].slice(0,10);localStorage.setItem(KEY,JSON.stringify(list));return list;}
export function loadResultHistory():StoredResult[]{try{const p:unknown=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(p)?p.filter((x):x is StoredResult=>typeof x==="object"&&x!==null&&"id" in x):[];}catch{return[];}}
export function deleteResult(id:string):StoredResult[]{const list=loadResultHistory().filter(x=>x.id!==id);localStorage.setItem(KEY,JSON.stringify(list));return list;} export function clearHistory():void{localStorage.removeItem(KEY);}
