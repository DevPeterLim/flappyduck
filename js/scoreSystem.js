/**
 * ScoreSystem 클래스 - 게임 점수 시스템 관리
 */
class ScoreSystem {
    /**
     * 점수 시스템 초기화
     * @param {HTMLElement} scoreDisplay - 점수 표시 요소
     * @param {HTMLElement} finalScoreElement - 최종 점수 표시 요소
     * @param {HTMLElement} highScoreElement - 최고 점수 표시 요소
     */
    constructor(scoreDisplay, finalScoreElement, highScoreElement) {
        this.scoreDisplay = scoreDisplay;
        this.finalScoreElement = finalScoreElement;
        this.highScoreElement = highScoreElement;
        
        // 점수 관련 상태
        this.score = 0;
        this.highScore = this.loadHighScore();
        
        // 점수 애니메이션 설정
        this.scoreAnimationActive = false;
        this.scoreAnimationDuration = 0.5; // 초
        this.scoreAnimationTimer = 0;
        this.scoreAnimationScale = 1;
        
        // 초기 UI 업데이트
        this.updateHighScoreDisplay();
    }
    
    /**
     * 점수 추가
     * @param {number} points - 추가할 점수
     * @returns {boolean} 점수가 추가되었는지 여부
     */
    addScore(points) {
        if (points <= 0) return false;
        
        this.score += points;
        this.updateScoreDisplay();
        this.startScoreAnimation();
        return true;
    }
    
    /**
     * 점수 초기화 (게임 재시작 시)
     */
    reset() {
        this.score = 0;
        this.updateScoreDisplay();
    }
    
    /**
     * 점수 애니메이션 시작
     */
    startScoreAnimation() {
        this.scoreAnimationActive = true;
        this.scoreAnimationTimer = this.scoreAnimationDuration;
        this.scoreAnimationScale = 1.5; // 시작 크기 (1.5배)
    }
    
    /**
     * 점수 애니메이션 업데이트
     * @param {number} deltaTime - 경과 시간 (초)
     */
    updateAnimation(deltaTime) {
        if (!this.scoreAnimationActive) return;
        
        this.scoreAnimationTimer -= deltaTime;
        
        // 애니메이션 진행률 (0~1)
        const progress = 1 - (this.scoreAnimationTimer / this.scoreAnimationDuration);
        
        // 크기 애니메이션 (1.5 -> 1)
        this.scoreAnimationScale = 1.5 - (0.5 * progress);
        
        // 애니메이션 적용
        this.scoreDisplay.style.transform = `scale(${this.scoreAnimationScale})`;
        
        // 애니메이션 종료
        if (this.scoreAnimationTimer <= 0) {
            this.scoreAnimationActive = false;
            this.scoreDisplay.style.transform = 'scale(1)';
        }
    }
    
    /**
     * 현재 점수 표시 업데이트
     */
    updateScoreDisplay() {
        this.scoreDisplay.textContent = this.score;
    }
    
    /**
     * 최고 점수 표시 업데이트
     */
    updateHighScoreDisplay() {
        if (this.highScoreElement) {
            this.highScoreElement.textContent = this.highScore;
        }
    }
    
    /**
     * 게임 종료 시 처리
     * @returns {boolean} 최고 점수 갱신 여부
     */
    finalizeScore() {
        // 최고 점수 체크 및 업데이트
        const isNewHighScore = this.score > this.highScore;
        
        if (isNewHighScore) {
            this.highScore = this.score;
            this.saveHighScore(this.highScore);
        }
        
        // 최종 점수 UI 업데이트
        if (this.finalScoreElement) {
            this.finalScoreElement.textContent = this.score;
        }
        
        if (this.highScoreElement) {
            this.highScoreElement.textContent = this.highScore;
        }
        
        return isNewHighScore;
    }
    
    /**
     * 최고 점수 로드
     * @returns {number} 저장된 최고 점수
     */
    loadHighScore() {
        const savedScore = localStorage.getItem('flappyBirdHighScore');
        return savedScore ? parseInt(savedScore) : 0;
    }
    
    /**
     * 최고 점수 저장
     * @param {number} score - 저장할 점수
     */
    saveHighScore(score) {
        localStorage.setItem('flappyBirdHighScore', score.toString());
    }
    
    /**
     * 현재 점수 가져오기
     * @returns {number} 현재 점수
     */
    getCurrentScore() {
        return this.score;
    }
    
    /**
     * 최고 점수 가져오기
     * @returns {number} 최고 점수
     */
    getHighScore() {
        return this.highScore;
    }
} 