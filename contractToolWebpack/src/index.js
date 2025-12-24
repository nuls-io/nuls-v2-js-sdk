/**
 * 入口文件 - 将 API 模块挂载到全局，供 HTML 使用
 */

import * as api from './api.js';
import BigNumber from 'bignumber.js';

// 将 BigNumber 暴露到全局，供 HTML 使用
if (typeof window !== 'undefined') {
    window.BigNumber = BigNumber;
}

// 将 API 函数挂载到全局 window 对象
// 使用立即执行确保在 HTML 脚本执行前就设置好
console.log('[Bundle] 开始执行 bundle.js');
console.log('[Bundle] window 对象:', typeof window !== 'undefined' ? '存在' : '不存在');
console.log('[Bundle] document 对象:', typeof document !== 'undefined' ? '存在' : '不存在');

(function() {
    try {
        console.log('[Bundle] 开始挂载 ContractToolAPI...');
        console.log('[Bundle] api 对象:', api);
        console.log('[Bundle] api 的键:', Object.keys(api));
        
        if (typeof window !== 'undefined') {
            window.ContractToolAPI = api;
            console.log('[Bundle] ✓ ContractToolAPI 已挂载到 window');
            console.log('[Bundle] ✓ 可用的 API 方法:', Object.keys(api));
            
            // 触发自定义事件，通知 API 已加载
            if (typeof document !== 'undefined') {
                // 使用 setTimeout 确保事件监听器已注册
                setTimeout(function() {
                    try {
                        const event = new CustomEvent('ContractToolAPIReady');
                        document.dispatchEvent(event);
                        console.log('[Bundle] ✓ ContractToolAPIReady 事件已触发');
                    } catch (e) {
                        console.error('[Bundle] 触发事件失败:', e);
                    }
                }, 0);
                
                // 如果 DOM 已经准备好，立即触发
                if (document.readyState !== 'loading') {
                    const event = new CustomEvent('ContractToolAPIReady');
                    document.dispatchEvent(event);
                    console.log('[Bundle] ✓ ContractToolAPIReady 事件已触发 (DOM已就绪)');
                }
            } else {
                console.warn('[Bundle] document 对象不存在，无法触发事件');
            }
        } else {
            console.error('[Bundle] ✗ window 对象不存在，无法挂载 ContractToolAPI');
        }
    } catch (error) {
        console.error('[Bundle] ✗ 挂载 ContractToolAPI 时出错:', error);
        console.error('[Bundle] ✗ 错误堆栈:', error.stack);
        throw error; // 重新抛出错误，让浏览器显示
    }
})();

console.log('[Bundle] bundle.js 执行完成');

// 导出供其他模块使用
export default api;

