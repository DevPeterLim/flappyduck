/**
 * CollisionSystem 클래스 - 게임 내 충돌 감지 및 처리를 담당하는 클래스
 */
class CollisionSystem {
    /**
     * 충돌 시스템 초기화
     * @param {Object} gameConfig - 게임 설정 (지면 높이 등)
     */
    constructor(gameConfig) {
        this.groundHeight = gameConfig.groundHeight || 0;
        this.debug = false;
        
        // 충돌 효과 설정
        this.isShowingCollision = false;
        this.collisionEffectDuration = 0.3; // 충돌 효과 지속 시간 (초)
        this.collisionEffectTimer = 0;
        this.lastCollisionPoint = null;
    }
    
    /**
     * 충돌 시스템 상태 초기화
     */
    reset() {
        this.isShowingCollision = false;
        this.collisionEffectTimer = 0;
        this.lastCollisionPoint = null;
    }
    
    /**
     * 디버그 모드 설정
     * @param {boolean} enabled - 디버그 모드 활성화 여부
     */
    setDebug(enabled) {
        this.debug = enabled;
    }
    
    /**
     * 새와 지면 사이의 충돌 검사
     * @param {Object} birdBounds - 새의 경계 정보
     * @param {number} canvasHeight - 캔버스 높이
     * @returns {Object|null} 충돌 정보 (위치, 유형) 또는 null
     */
    checkGroundCollision(birdBounds, canvasHeight) {
        // 지면 충돌 검사
        if (birdBounds.bottom > canvasHeight - this.groundHeight) {
            return {
                type: 'ground',
                point: {
                    x: birdBounds.left + (birdBounds.right - birdBounds.left) / 2,
                    y: canvasHeight - this.groundHeight
                }
            };
        }
        
        return null;
    }
    
    /**
     * 새와 천장 사이의 충돌 검사
     * @param {Object} birdBounds - 새의 경계 정보
     * @returns {Object|null} 충돌 정보 (위치, 유형) 또는 null
     */
    checkCeilingCollision(birdBounds) {
        // 천장 충돌 검사
        if (birdBounds.top < 0) {
            return {
                type: 'ceiling',
                point: {
                    x: birdBounds.left + (birdBounds.right - birdBounds.left) / 2,
                    y: 0
                }
            };
        }
        
        return null;
    }
    
    /**
     * 새와 파이프 사이의 충돌 검사
     * @param {Object} birdBounds - 새의 경계 정보
     * @param {PipeManager} pipeManager - 파이프 매니저 객체
     * @returns {Object|null} 충돌 정보 (위치, 유형) 또는 null
     */
    checkPipeCollision(birdBounds, pipeManager) {
        for (const pipe of pipeManager.pipes) {
            const pipeBounds = pipe.getBounds();
            
            // 새와 파이프의 수평 위치가 겹치는지 확인
            if (birdBounds.right > pipeBounds.top.left && birdBounds.left < pipeBounds.top.right) {
                // 상단 파이프와 충돌 검사
                if (birdBounds.top < pipeBounds.top.bottom) {
                    return {
                        type: 'pipe_top',
                        point: {
                            x: Math.max(birdBounds.left, pipeBounds.top.left),
                            y: pipeBounds.top.bottom
                        },
                        pipe: pipe
                    };
                }
                
                // 하단 파이프와 충돌 검사
                if (birdBounds.bottom > pipeBounds.bottom.top) {
                    return {
                        type: 'pipe_bottom',
                        point: {
                            x: Math.max(birdBounds.left, pipeBounds.bottom.left),
                            y: pipeBounds.bottom.top
                        },
                        pipe: pipe
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * 모든 충돌 검사
     * @param {Bird} bird - 새 객체
     * @param {PipeManager} pipeManager - 파이프 매니저 객체
     * @param {number} canvasHeight - 캔버스 높이
     * @returns {Object|null} 충돌 정보 (위치, 유형) 또는 null
     */
    checkCollisions(bird, pipeManager, canvasHeight) {
        // 새의 경계 가져오기
        const birdBounds = bird.getBounds();
        
        // 지면 충돌 검사
        const groundCollision = this.checkGroundCollision(birdBounds, canvasHeight);
        if (groundCollision) {
            return groundCollision;
        }
        
        // 파이프 충돌 검사 (천장보다 우선순위 높음)
        const pipeCollision = this.checkPipeCollision(birdBounds, pipeManager);
        if (pipeCollision) {
            return pipeCollision;
        }
        
        // 천장 충돌 검사 (스코어링 효과가 있으므로 실제 충돌로 처리하지 않음)
        const ceilingCollision = this.checkCeilingCollision(birdBounds);
        if (ceilingCollision) {
            bird.y = bird.height / 2;
            bird.velocity = 0;
            
            // null 반환하여 게임 오버 처리하지 않음
            return null;
        }
        
        return null;
    }
    
    /**
     * 충돌 효과 업데이트
     * @param {number} deltaTime - 경과 시간 (초)
     */
    updateCollisionEffect(deltaTime) {
        if (this.isShowingCollision) {
            this.collisionEffectTimer -= deltaTime;
            
            if (this.collisionEffectTimer <= 0) {
                this.isShowingCollision = false;
                this.lastCollisionPoint = null;
            }
        }
    }
    
    /**
     * 충돌 효과 시작
     * @param {Object} collisionInfo - 충돌 정보 (위치, 유형)
     */
    startCollisionEffect(collisionInfo) {
        this.isShowingCollision = true;
        this.collisionEffectTimer = this.collisionEffectDuration;
        this.lastCollisionPoint = collisionInfo.point;
    }
    
    /**
     * 충돌 효과 렌더링
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     */
    renderCollisionEffect(ctx) {
        if (this.isShowingCollision && this.lastCollisionPoint) {
            const alpha = this.collisionEffectTimer / this.collisionEffectDuration;
            const radius = 30 * (1 - alpha) + 10;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // 충돌 효과 (확장하는 원)
            ctx.beginPath();
            ctx.arc(this.lastCollisionPoint.x, this.lastCollisionPoint.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fill();
            
            // 중심 원
            ctx.beginPath();
            ctx.arc(this.lastCollisionPoint.x, this.lastCollisionPoint.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    /**
     * 디버그 충돌 영역 렌더링
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     * @param {Bird} bird - 새 객체
     * @param {PipeManager} pipeManager - 파이프 매니저 객체
     * @param {number} canvasWidth - 캔버스 너비
     * @param {number} canvasHeight - 캔버스 높이
     */
    renderDebugColliders(ctx, bird, pipeManager, canvasWidth, canvasHeight) {
        if (!this.debug) return;
        
        // 새의 경계 영역
        const birdBounds = bird.getBounds();
        
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            birdBounds.left,
            birdBounds.top,
            birdBounds.right - birdBounds.left,
            birdBounds.bottom - birdBounds.top
        );
        
        // 지면 경계 영역
        ctx.strokeStyle = 'rgba(128, 64, 0, 0.8)';
        ctx.strokeRect(
            0, 
            canvasHeight - this.groundHeight,
            canvasWidth,
            this.groundHeight
        );
        
        // 천장 경계 영역
        ctx.strokeStyle = 'rgba(0, 128, 255, 0.8)';
        ctx.strokeRect(
            0, 
            0,
            canvasWidth,
            1
        );
        
        ctx.restore();
    }
} 