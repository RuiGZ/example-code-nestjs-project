/** 教学用：终端按节点打印，对照请求生命周期顺序 */
export function lifecycleLog(stage: string, detail = '') {
  console.log(`[生命周期] ${stage}${detail ? ` | ${detail}` : ''}`);
}
