/**
 * AudioManager 클래스 - 게임 오디오 관리 시스템
 */
class AudioManager {
    /**
     * 오디오 매니저 초기화
     * @param {Object} audioElements - 게임에 사용할 오디오 요소들
     */
    constructor(audioElements = {}) {
        // 오디오 상태
        this.sounds = audioElements;
        this.muted = localStorage.getItem('flappyBirdMuted') === 'true' || false;
        this.volume = parseFloat(localStorage.getItem('flappyBirdVolume') || '0.5');
        
        // 현재 재생 중인 배경 음악
        this.bgMusicPlaying = false;
        
        // 볼륨 세션 상태 - 모바일에서 첫 상호작용 필요
        this.audioSessionInitialized = false;
    }
    
    /**
     * 오디오 요소 추가
     * @param {string} name - 오디오 식별자
     * @param {HTMLAudioElement} audio - 오디오 요소
     */
    addSound(name, audio) {
        this.sounds[name] = audio;
        
        // 기본 설정 적용
        audio.volume = this.volume;
        audio.muted = this.muted;
    }
    
    /**
     * 오디오 음소거 토글
     * @returns {boolean} 현재 음소거 상태
     */
    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('flappyBirdMuted', this.muted);
        this.updateMuteState();
        return this.muted;
    }
    
    /**
     * 모든 오디오에 음소거 상태 적용
     */
    updateMuteState() {
        // 모든 오디오 요소에 음소거 상태 적용
        for (const key in this.sounds) {
            if (this.sounds[key]) {
                this.sounds[key].muted = this.muted;
            }
        }
    }
    
    /**
     * 볼륨 설정
     * @param {number} value - 볼륨 값 (0~1)
     */
    setVolume(value) {
        // 볼륨 범위 제한 (0~1)
        this.volume = Math.max(0, Math.min(1, value));
        localStorage.setItem('flappyBirdVolume', this.volume.toString());
        
        // 모든 오디오 요소에 볼륨 적용
        for (const key in this.sounds) {
            if (this.sounds[key]) {
                this.sounds[key].volume = this.volume;
            }
        }
    }
    
    /**
     * 오디오 재생
     * @param {string} soundName - 재생할 오디오 이름
     * @param {Object} options - 재생 옵션 (loop, volume)
     * @returns {Promise} 재생 성공/실패 프로미스
     */
    play(soundName, options = {}) {
        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`오디오 ${soundName}을(를) 찾을 수 없습니다.`);
            return Promise.reject(`오디오 ${soundName}을(를) 찾을 수 없습니다.`);
        }
        
        // 오디오 세션 초기화 시도
        if (!this.audioSessionInitialized) {
            this.initAudioSession();
        }
        
        // 재생 옵션 적용
        sound.loop = !!options.loop;
        if (options.volume !== undefined) {
            sound.volume = Math.max(0, Math.min(1, options.volume)) * this.volume;
        }
        
        // 시작 위치 초기화 (이미 재생 중인 소리는 처음부터 다시 재생)
        sound.currentTime = 0;
        
        // 재생 시도 및 예외 처리
        const playPromise = sound.play();
        
        // play()가 프로미스를 반환하는 브라우저 대응
        if (playPromise !== undefined) {
            return playPromise.catch(error => {
                console.warn('오디오 재생 실패:', error);
                
                // 사용자 상호작용 부족으로 인한 자동재생 실패 감지
                if (error.name === 'NotAllowedError') {
                    console.info('자동 재생이 차단되었습니다. 사용자 상호작용이 필요합니다.');
                    this.audioSessionInitialized = false;
                }
                
                return Promise.reject(error);
            });
        }
        
        return Promise.resolve();
    }
    
    /**
     * 배경 음악 재생
     * @param {string} musicName - 배경 음악 이름
     */
    playBackgroundMusic(musicName) {
        const music = this.sounds[musicName];
        if (!music) {
            console.warn(`배경 음악 ${musicName}을(를) 찾을 수 없습니다.`);
            return;
        }
        
        // 기존 배경 음악 정지
        this.stopBackgroundMusic();
        
        // 새 배경 음악 설정
        music.loop = true;
        music.volume = this.volume * 0.7; // 배경음은 약간 더 작게
        
        // 배경 음악 재생
        this.play(musicName, { loop: true }).then(() => {
            this.bgMusicPlaying = true;
        }).catch(error => {
            console.warn('배경 음악 재생 실패:', error);
        });
    }
    
    /**
     * 배경 음악 정지
     */
    stopBackgroundMusic() {
        for (const key in this.sounds) {
            const sound = this.sounds[key];
            if (sound && sound.loop) {
                sound.pause();
                sound.currentTime = 0;
            }
        }
        this.bgMusicPlaying = false;
    }
    
    /**
     * 모든 오디오 정지
     */
    stopAll() {
        for (const key in this.sounds) {
            if (this.sounds[key]) {
                this.sounds[key].pause();
                this.sounds[key].currentTime = 0;
            }
        }
        this.bgMusicPlaying = false;
    }
    
    /**
     * 오디오 세션 초기화 (모바일 자동재생 제한 대응)
     */
    initAudioSession() {
        // 모바일 브라우저에서는 최초 사용자 상호작용이 필요함
        // 사일런트 오디오를 재생하여 오디오 세션 초기화
        const silentSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABGwD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAQAAAAAAAAAAABSAJALqTQAAgAAAARtDU9IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tSZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
        silentSound.volume = 0.001;
        silentSound.play().then(() => {
            this.audioSessionInitialized = true;
        }).catch(() => {
            // 상호작용 없이 초기화 실패 - 문제 없음, 사용자 상호작용 시 다시 시도
        });
    }
    
    /**
     * 현재 음소거 상태 가져오기
     * @returns {boolean} 음소거 상태
     */
    isMuted() {
        return this.muted;
    }
    
    /**
     * 현재 볼륨 가져오기
     * @returns {number} 볼륨 (0~1)
     */
    getVolume() {
        return this.volume;
    }
    
    /**
     * 배경 음악 재생 중인지 확인
     * @returns {boolean} 배경 음악 재생 중 여부
     */
    isBackgroundMusicPlaying() {
        return this.bgMusicPlaying;
    }
} 