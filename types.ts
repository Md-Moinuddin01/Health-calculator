export type UnitSystem = "metric" | "imperial";
export type Gender = "male" | "female" | "unspecified";
export interface BMIInput { age:number; gender:Gender; unit:UnitSystem; heightCm:number; weightKg:number; displayHeight:string; displayWeight:string; }
export interface BMIResult { bmi:number; category:string; status:string; healthyMin:number; healthyMax:number; difference:string; recommendation:string; input:BMIInput; createdAt:string; }
export interface StoredResult { id:string; createdAt:string; bmi:number; category:string; weight:string; }
export interface IdealWeights { devine:number; robinson:number; miller:number; hamwi:number; average:number; }
export interface WaterResult { ml:number; litres:number; glasses:number; }
