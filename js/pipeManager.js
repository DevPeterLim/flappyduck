/**
 * PipeManager 클래스 - 파이프 생성 및 관리를 담당하는 클래스
 */
class PipeManager {
    /**
     * 파이프 매니저 초기화
     * @param {number} canvasWidth - 캔버스 너비
     * @param {number} canvasHeight - 캔버스 높이
     * @param {number} groundHeight - 지면 높이
     * @param {Object} config - 파이프 설정 (간격, 속도 등)
     * @param {Object} images - 파이프 이미지 (상단, 하단)
     * @param {Array} adImages - 광고 이미지 배열 (선택사항)
     */
    constructor(canvasWidth, canvasHeight, groundHeight, config, images, adImages = []) {
        // 캔버스 정보
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.groundHeight = groundHeight;
        
        // 파이프 설정
        this.pipeWidth = config.pipeWidth || 60;
        this.pipeGap = config.pipeGap || 160; // 파이프 사이 간격 (새가 통과하는 공간)
        this.pipeSpawnInterval = config.pipeSpawnInterval || 1.5; // 파이프 생성 간격 (초)
        this.pipeSpeed = config.pipeSpeed || 200; // 파이프 이동 속도 (픽셀/초)
        
        // 파이프 생성 설정
        this.minGapY = 80; // 상단 파이프와 화면 상단 사이 최소 간격
        this.maxGapY = this.canvasHeight - this.pipeGap - this.groundHeight - 80; // 하단 파이프와 지면 사이 최소 간격
        
        // 이미지
        this.images = images || { topImage: null, bottomImage: null };
        
        // 광고 이미지
        this.adImages = adImages;
        this.adFrequency = [3, 5, 7, 9, 12, 15]; // 광고가 표시될 파이프 인덱스
        
        // 상태
        this.pipes = []; // 현재 화면에 있는 파이프 배열
        this.timer = 0; // 파이프 생성 타이머
        this.pipeCount = 0; // 생성된 파이프 카운트
    }
    
    /**
     * 파이프 생성
     */
    createPipe() {
        // 파이프 간격(새가 지나갈 수 있는 공간)의 위치 랜덤 설정
        const gapY = Math.random() * (this.maxGapY - this.minGapY) + this.minGapY;
        
        // 파이프 카운트 증가
        this.pipeCount++;
        
        // 광고 이미지 선택 (특정 파이프 번호에만 표시)
        let adImage = null;
        if (this.adImages.length > 0 && this.adFrequency.includes(this.pipeCount)) {
            // 광고 이미지 중 랜덤 선택
            const randomAdIndex = Math.floor(Math.random() * this.adImages.length);
            adImage = this.adImages[randomAdIndex];
            console.log(`파이프 #${this.pipeCount}에 광고 이미지 추가됨`);
        }
        
        // 새로운 파이프 객체 생성
        const pipe = new Pipe(
            this.canvasWidth, // 화면 오른쪽에서 시작
            gapY,
            this.pipeGap,
            this.pipeWidth,
            this.images,
            adImage,
            this.pipeCount // 파이프 번호
        );
        
        // 파이프 배열에 추가
        this.pipes.push(pipe);
    }
    
    /**
     * 모든 파이프 업데이트
     * @param {number} deltaTime - 경과 시간 (초)
     */
    update(deltaTime) {
        // 파이프 생성 타이머 업데이트
        this.timer += deltaTime;
        
        // 일정 간격으로 새 파이프 생성
        if (this.timer >= this.pipeSpawnInterval) {
            this.createPipe();
            this.timer = 0;
        }
        
        // 모든 파이프 위치 업데이트
        for (const pipe of this.pipes) {
            pipe.update(this.pipeSpeed, deltaTime);
        }
        
        // 화면 밖으로 나간 파이프 제거 (메모리 최적화)
        this.pipes = this.pipes.filter(pipe => !pipe.isOffScreen());
    }
    
    /**
     * 모든 파이프 렌더링
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     * @param {boolean} debug - 디버그 모드 여부
     */
    render(ctx, debug = false) {
        for (const pipe of this.pipes) {
            pipe.render(ctx, this.canvasHeight, this.groundHeight, debug);
        }
    }
    
    /**
     * 새와 파이프 사이의 충돌 검사
     * @param {Object} birdBounds - 새의 경계 정보 (left, right, top, bottom)
     * @returns {boolean} 충돌 여부
     */
    checkCollision(birdBounds) {
        for (const pipe of this.pipes) {
            const pipeBounds = pipe.getBounds();
            
            // 새와 파이프의 수평 위치가 겹치는지 확인
            if (birdBounds.right > pipeBounds.top.left && birdBounds.left < pipeBounds.top.right) {
                // 상단 파이프와 충돌 검사
                if (birdBounds.top < pipeBounds.top.bottom) {
                    return true;
                }
                
                // 하단 파이프와 충돌 검사
                if (birdBounds.bottom > pipeBounds.bottom.top) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * 점수 업데이트 확인 (새가 파이프를 통과했는지)
     * @param {Object} birdBounds - 새의 경계 정보 (left, right, top, bottom)
     * @returns {number} 획득한 점수 (0 또는 1)
     */
    checkScoring(birdBounds) {
        let score = 0;
        
        for (const pipe of this.pipes) {
            // 새가 파이프를 통과했는지 확인 (파이프의 오른쪽 끝이 새의 왼쪽을 지났을 때)
            if (!pipe.scored && pipe.x + pipe.width < birdBounds.left) {
                pipe.scored = true;
                score++;
            }
        }
        
        return score;
    }
    
    /**
     * 모든 파이프 초기화 (게임 재시작 시)
     */
    reset() {
        this.pipes = [];
        this.timer = 0;
        this.pipeCount = 0; // 파이프 카운트 초기화
    }
    
    /**
     * 캔버스 크기 변경 처리
     * @param {number} canvasWidth - 새 캔버스 너비
     * @param {number} canvasHeight - 새 캔버스 높이
     */
    resize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.maxGapY = this.canvasHeight - this.pipeGap - this.groundHeight - 80;
    }
} 