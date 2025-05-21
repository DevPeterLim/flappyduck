/**
 * 게임 루프 유틸리티 - 게임 루프 관리 및 FPS 관련 기능
 */
const GameLoop = (function() {
    // 상태 변수
    let _lastTime = 0;           // 마지막 프레임 타임스탬프
    let _frameCount = 0;         // 프레임 카운트
    let _fpsUpdateTime = 0;      // FPS 업데이트 타이머
    let _fps = 0;                // 현재 FPS
    let _requestId = null;       // requestAnimationFrame ID
    let _running = false;        // 루프 실행 상태
    
    // 콜백 함수
    let _updateCallback = null;  // 업데이트 콜백
    let _renderCallback = null;  // 렌더링 콜백
    
    /**
     * FPS 계산 및 업데이트
     * @param {number} timestamp - 현재 타임스탬프
     * @returns {number} 현재 FPS
     */
    function calculateFPS(timestamp) {
        // 프레임 카운트 증가
        _frameCount++;
        
        // 1초마다 FPS 계산
        if (timestamp - _fpsUpdateTime >= 1000) {
            // FPS = 초당 프레임 수
            _fps = _frameCount * 1000 / (timestamp - _fpsUpdateTime);
            
            // 카운터 초기화
            _fpsUpdateTime = timestamp;
            _frameCount = 0;
        }
        
        return _fps;
    }
    
    /**
     * 메인 게임 루프
     * @param {number} timestamp - 현재 프레임 타임스탬프
     */
    function loop(timestamp) {
        // 델타 타임 계산 (밀리초)
        const deltaTime = timestamp - (_lastTime || timestamp);
        _lastTime = timestamp;
        
        // FPS 계산
        const currentFPS = calculateFPS(timestamp);
        
        // 실행 중이면 다음 프레임 예약
        if (_running) {
            _requestId = requestAnimationFrame(loop);
        }
        
        // 업데이트 콜백 호출 (초 단위 델타타임 전달)
        if (_updateCallback) {
            _updateCallback(deltaTime / 1000, currentFPS);
        }
        
        // 렌더링 콜백 호출
        if (_renderCallback) {
            _renderCallback(currentFPS);
        }
    }
    
    /**
     * 게임 루프 시작
     * @param {Function} updateCallback - 업데이트 콜백 함수, deltaTime(초단위)와 fps를 인자로 받음
     * @param {Function} renderCallback - 렌더링 콜백 함수, fps를 인자로 받음
     */
    function start(updateCallback, renderCallback) {
        // 콜백 함수 설정
        _updateCallback = updateCallback;
        _renderCallback = renderCallback;
        
        // 상태 초기화
        _running = true;
        _lastTime = 0;
        _frameCount = 0;
        _fpsUpdateTime = 0;
        
        // 게임 루프 시작
        _requestId = requestAnimationFrame(loop);
        
        return {
            update: updateCallback,
            render: renderCallback
        };
    }
    
    /**
     * 게임 루프 정지
     */
    function stop() {
        _running = false;
        
        if (_requestId !== null) {
            cancelAnimationFrame(_requestId);
            _requestId = null;
        }
    }
    
    /**
     * FPS 제한을 적용한 콜백 함수 생성
     * @param {Function} callback - 제한할 콜백 함수
     * @param {number} targetFPS - 목표 FPS
     * @returns {Function} FPS 제한이 적용된 함수
     */
    function createFPSLimiter(callback, targetFPS) {
        const frameInterval = 1000 / targetFPS; // 프레임 간격 (ms)
        let lastFrameTime = 0;
        
        return function(timestamp) {
            const elapsed = timestamp - lastFrameTime;
            
            if (elapsed >= frameInterval) {
                lastFrameTime = timestamp - (elapsed % frameInterval);
                callback(timestamp);
            }
        };
    }
    
    /**
     * 타임스케일을 적용한 델타타임 계산
     * @param {number} deltaTime - 원래 델타타임 (초)
     * @param {number} timeScale - 타임스케일 (1 = 정상 속도, 0.5 = 슬로우 모션, 2 = 2배 속도)
     * @returns {number} 적용된 델타타임
     */
    function applyTimeScale(deltaTime, timeScale) {
        return deltaTime * timeScale;
    }
    
    /**
     * 현재 FPS 가져오기
     * @returns {number} 현재 FPS
     */
    function getFPS() {
        return _fps;
    }
    
    /**
     * 루프가 실행 중인지 확인
     * @returns {boolean} 실행 중 여부
     */
    function isRunning() {
        return _running;
    }
    
    // 공개 API
    return {
        start,
        stop,
        getFPS,
        isRunning,
        createFPSLimiter,
        applyTimeScale
    };
})(); 