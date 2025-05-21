/**
 * 에셋 로더 - 이미지와 사운드 파일을 비동기적으로 로드하는 모듈
 */
const AssetLoader = (function() {
    // 에셋 저장소
    const assets = {
        images: {},
        sounds: {}
    };
    
    // 로딩 상태
    let totalAssets = 0;
    let loadedAssets = 0;
    let onProgressCallback = null;
    let onCompleteCallback = null;
    
    /**
     * 이미지 파일 로드
     * @param {string} name - 이미지 참조 이름
     * @param {string} src - 이미지 파일 경로
     * @returns {Promise} 로딩 프로미스
     */
    function loadImage(name, src) {
        totalAssets++;
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = function() {
                assets.images[name] = img;
                loadedAssets++;
                updateProgress();
                resolve(img);
            };
            
            img.onerror = function() {
                console.error(`이미지 로드 실패: ${src}`);
                loadedAssets++;
                updateProgress();
                reject(new Error(`이미지 로드 실패: ${src}`));
            };
            
            img.src = src;
        });
    }
    
    /**
     * 오디오 파일 로드
     * @param {string} name - 오디오 참조 이름
     * @param {string} src - 오디오 파일 경로
     * @returns {Promise} 로딩 프로미스
     */
    function loadSound(name, src) {
        totalAssets++;
        
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            
            audio.oncanplaythrough = function() {
                assets.sounds[name] = audio;
                loadedAssets++;
                updateProgress();
                resolve(audio);
            };
            
            audio.onerror = function() {
                console.error(`오디오 로드 실패: ${src}`);
                loadedAssets++;
                updateProgress();
                reject(new Error(`오디오 로드 실패: ${src}`));
            };
            
            audio.src = src;
            audio.load();
        });
    }
    
    /**
     * 로딩 진행 상태 업데이트 및 콜백 처리
     */
    function updateProgress() {
        const progress = loadedAssets / totalAssets;
        
        if (onProgressCallback) {
            onProgressCallback(progress);
        }
        
        if (loadedAssets === totalAssets && onCompleteCallback) {
            onCompleteCallback();
        }
    }
    
    /**
     * 이미지 접근
     * @param {string} name - 이미지 참조 이름
     * @returns {HTMLImageElement} 이미지 객체
     */
    function getImage(name) {
        return assets.images[name];
    }
    
    /**
     * 오디오 접근
     * @param {string} name - 오디오 참조 이름
     * @returns {HTMLAudioElement} 오디오 객체
     */
    function getSound(name) {
        // 오디오 복제본 반환 (여러 소리를 동시에 재생할 수 있도록)
        if (assets.sounds[name]) {
            return assets.sounds[name].cloneNode();
        }
        return null;
    }
    
    /**
     * 진행 콜백 설정
     * @param {Function} callback - 진행률을 받는 콜백 함수
     */
    function onProgress(callback) {
        onProgressCallback = callback;
    }
    
    /**
     * 완료 콜백 설정
     * @param {Function} callback - 로딩 완료 시 호출되는 콜백 함수
     */
    function onComplete(callback) {
        onCompleteCallback = callback;
    }
    
    /**
     * 모든 에셋 로드
     * @param {Object} imageFiles - 이미지 파일 목록 {name: src}
     * @param {Object} soundFiles - 사운드 파일 목록 {name: src}
     * @returns {Promise} 모든 에셋 로딩 프로미스
     */
    function loadAll(imageFiles = {}, soundFiles = {}) {
        // 로딩 상태 초기화
        totalAssets = 0;
        loadedAssets = 0;
        
        const promises = [];
        
        // 이미지 로드
        for (const [name, src] of Object.entries(imageFiles)) {
            promises.push(loadImage(name, src));
        }
        
        // 사운드 로드
        for (const [name, src] of Object.entries(soundFiles)) {
            promises.push(loadSound(name, src));
        }
        
        return Promise.all(promises);
    }
    
    // 공개 API
    return {
        loadImage,
        loadSound,
        loadAll,
        getImage,
        getSound,
        onProgress,
        onComplete
    };
})(); 