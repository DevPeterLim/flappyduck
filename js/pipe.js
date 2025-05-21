/**
 * Pipe 클래스 - 장애물 파이프를 구현하는 클래스
 */
class Pipe {
    /**
     * 파이프 객체 초기화
     * @param {number} x - 파이프의 초기 X 위치 (화면 오른쪽)
     * @param {number} gapY - 파이프 간격의 시작 위치
     * @param {number} gapHeight - 파이프 간격의 높이
     * @param {number} width - 파이프의 너비
     * @param {Object} images - 파이프 이미지 객체 (topImage, bottomImage)
     * @param {Image} adImage - 광고 이미지 (선택사항)
     * @param {number} pipeNumber - 파이프 번호 (선택사항)
     */
    constructor(x, gapY, gapHeight, width, images, adImage = null, pipeNumber = 0) {
        // 위치 및 크기
        this.x = x;
        this.width = width || 60;
        this.gapY = gapY;
        this.gapHeight = gapHeight;
        
        // 이미지
        this.topImage = images ? images.topImage : null;
        this.bottomImage = images ? images.bottomImage : null;
        
        // 광고 이미지 관련
        this.adImage = adImage;
        this.pipeNumber = pipeNumber;
        
        // 상태
        this.scored = false; // 이 파이프를 통과해 점수를 획득했는지 여부
    }
    
    /**
     * 파이프 위치 업데이트
     * @param {number} speed - 이동 속도 (픽셀/초)
     * @param {number} deltaTime - 경과 시간 (초)
     */
    update(speed, deltaTime) {
        // 왼쪽으로 이동
        this.x -= speed * deltaTime;
    }
    
    /**
     * 화면 밖으로 완전히 나갔는지 확인
     * @returns {boolean} 화면 밖으로 나갔으면 true
     */
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    /**
     * 파이프 렌더링
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     * @param {number} canvasHeight - 캔버스 높이
     * @param {number} groundHeight - 지면 높이
     * @param {boolean} debug - 디버그 모드 여부
     */
    render(ctx, canvasHeight, groundHeight, debug = false) {
        // 컨텍스트 저장
        ctx.save();
        
        // 디버그 모드일 경우 충돌 영역 표시
        if (debug) {
            // 상단 파이프 충돌 영역
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(this.x, 0, this.width, this.gapY);
            
            // 하단 파이프 충돌 영역
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(this.x, this.gapY + this.gapHeight, this.width, canvasHeight - this.gapY - this.gapHeight - groundHeight);
        }
        
        // 상단 파이프 그리기
        const topPipeHeight = this.gapY;
        if (this.topImage) {
            ctx.drawImage(
                this.topImage,
                this.x,
                this.gapY - topPipeHeight,
                this.width,
                topPipeHeight
            );
        } else {
            // 이미지가 없는 경우 대체 렌더링
            ctx.fillStyle = '#75B855'; // 녹색
            ctx.fillRect(this.x, 0, this.width, this.gapY);
        }
        
        // 하단 파이프 그리기
        const bottomPipeHeight = canvasHeight - this.gapY - this.gapHeight - groundHeight;
        if (this.bottomImage) {
            ctx.drawImage(
                this.bottomImage,
                this.x,
                this.gapY + this.gapHeight,
                this.width,
                bottomPipeHeight
            );
        } else {
            // 이미지가 없는 경우 대체 렌더링
            ctx.fillStyle = '#75B855'; // 녹색
            ctx.fillRect(this.x, this.gapY + this.gapHeight, this.width, bottomPipeHeight);
        }
        
        // 광고 이미지 렌더링 (있는 경우)
        if (this.adImage) {
            // 파이프 사이 가운데에 이미지 표시
            const adWidth = this.width * 1.5; // 파이프보다 약간 넓게
            const adHeight = this.gapHeight * 0.75; // 간격의 75% 높이로
            
            const adX = this.x - (adWidth - this.width) / 2; // 파이프 중앙에 위치
            const adY = this.gapY + (this.gapHeight - adHeight) / 2; // 간격 중앙에 위치
            
            // 광고 이미지 그리기
            ctx.drawImage(
                this.adImage,
                adX,
                adY,
                adWidth,
                adHeight
            );
            
            // 디버그 모드일 경우 파이프 번호 표시
            if (debug) {
                ctx.fillStyle = 'white';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`#${this.pipeNumber}`, adX + adWidth / 2, adY - 5);
            }
        }
        
        // 컨텍스트 복원
        ctx.restore();
    }
    
    /**
     * 충돌 검사를 위한 경계 가져오기
     * @returns {Object} 상단/하단 파이프의 경계 정보
     */
    getBounds() {
        return {
            // 상단 파이프 경계
            top: {
                left: this.x,
                right: this.x + this.width,
                top: 0,
                bottom: this.gapY
            },
            // 하단 파이프 경계
            bottom: {
                left: this.x,
                right: this.x + this.width,
                top: this.gapY + this.gapHeight,
                bottom: Infinity // 화면 하단까지
            }
        };
    }
} 