/**
 * Bird 클래스 - 플레이어 캐릭터(새)를 구현하는 클래스
 */
class Bird {
    /**
     * 새 객체 초기화
     * @param {number} x - 새의 초기 X 위치
     * @param {number} y - 새의 초기 Y 위치
     * @param {Array} images - 새의 애니메이션 이미지 배열
     * @param {Object} config - 새의 설정 (너비, 높이, 중력, 점프 힘 등)
     */
    constructor(x, y, images, config) {
        // 위치 및 크기
        this.x = x;
        this.y = y;
        this.width = config.width || 40;
        this.height = config.height || 30;
        
        // 물리 속성
        this.velocity = 0;
        this.gravity = config.gravity || 1200;
        this.jumpForce = config.jumpForce || -400;
        
        // 회전 속성
        this.rotation = 0;
        this.maxRotation = Math.PI / 4;  // 최대 회전 각도 (45도)
        this.minRotation = -Math.PI / 4; // 최소 회전 각도 (-45도)
        
        // 애니메이션 속성
        this.frame = 0;
        this.animTimer = 0;
        this.animInterval = 0.2; // 프레임 변경 간격 (초)
        this.images = images;
        this.totalFrames = images ? images.length : 0;
    }
    
    /**
     * 새 상태 업데이트
     * @param {number} deltaTime - 경과 시간 (초)
     */
    update(deltaTime) {
        // 중력 적용
        this.velocity += this.gravity * deltaTime;
        this.y += this.velocity * deltaTime;
        
        // 회전 업데이트 (속도에 따라 새의 회전 각도 변경)
        this.rotation = Math.min(this.maxRotation, Math.max(this.minRotation, this.velocity / 600));
        
        // 날개 짓 애니메이션 업데이트
        if (this.totalFrames > 1) {
            this.animTimer += deltaTime;
            if (this.animTimer >= this.animInterval) {
                this.frame = (this.frame + 1) % this.totalFrames;
                this.animTimer = 0;
            }
        }
    }
    
    /**
     * 점프 (날갯짓) 메서드
     * @returns {Object} 사운드 재생 상태 객체
     */
    jump() {
        this.velocity = this.jumpForce;
        return { shouldPlaySound: true };
    }
    
    /**
     * 새 렌더링
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     * @param {boolean} debug - 디버그 모드 여부
     */
    render(ctx, debug = false) {
        // 컨텍스트 저장
        ctx.save();
        
        // 새의 중심으로 이동
        ctx.translate(this.x, this.y);
        
        // 새의 속도에 따라 회전 적용
        ctx.rotate(this.rotation);
        
        // 디버그 모드일 경우 충돌 영역 표시
        if (debug) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        
        // 이미지가 로드되었는지 확인 후 이미지 그리기
        if (this.images && this.images[this.frame]) {
            // 현재 프레임의 이미지 그리기
            ctx.drawImage(
                this.images[this.frame],
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            // 이미지 로드 실패 시 임시 이미지(노란색 원) 그리기
            ctx.fillStyle = '#FFD700'; // 노란색
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 컨텍스트 복원
        ctx.restore();
    }
    
    /**
     * 충돌 검사를 위한 경계 가져오기
     * @returns {Object} 경계 정보 (x, y, width, height)
     */
    getBounds() {
        return {
            left: this.x - this.width / 2,
            right: this.x + this.width / 2,
            top: this.y - this.height / 2,
            bottom: this.y + this.height / 2
        };
    }
    
    /**
     * 새 위치 재설정
     * @param {number} x - 새 X 위치
     * @param {number} y - 새 Y 위치
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.rotation = 0;
        this.frame = 0;
        this.animTimer = 0;
    }
} 