/**
 * 렌더링 유틸리티 - 캔버스 렌더링 관련 유틸리티 함수 모음
 */
const RenderUtils = (function() {
    /**
     * 스프라이트를 캔버스에 그림
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     * @param {HTMLImageElement} image - 이미지 요소
     * @param {number} x - x 좌표
     * @param {number} y - y 좌표
     * @param {number} width - 너비
     * @param {number} height - 높이
     * @param {number} rotation - 회전 각도 (라디안)
     */
    function drawSprite(ctx, image, x, y, width, height, rotation = 0) {
        ctx.save(); // 현재 상태 저장
        
        // 회전 중심점으로 이동
        ctx.translate(x + width / 2, y + height / 2);
        
        // 회전
        ctx.rotate(rotation);
        
        // 이미지 그리기 (중앙 기준)
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
        
        ctx.restore(); // 저장한 상태로 복원
    }
    
    /**
     * 스프라이트 시트에서 특정 프레임을 추출하여 그림
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     * @param {HTMLImageElement} image - 스프라이트 시트 이미지
     * @param {number} frameX - 프레임 X 인덱스
     * @param {number} frameY - 프레임 Y 인덱스
     * @param {number} frameWidth - 프레임 너비
     * @param {number} frameHeight - 프레임 높이
     * @param {number} x - 대상 x 좌표
     * @param {number} y - 대상 y 좌표
     * @param {number} width - 대상 너비
     * @param {number} height - 대상 높이
     * @param {number} rotation - 회전 각도 (라디안)
     */
    function drawSpriteFrame(ctx, image, frameX, frameY, frameWidth, frameHeight, x, y, width, height, rotation = 0) {
        ctx.save(); // 현재 상태 저장
        
        // 회전 중심점으로 이동
        ctx.translate(x + width / 2, y + height / 2);
        
        // 회전
        ctx.rotate(rotation);
        
        // 스프라이트 시트에서 특정 프레임 추출하여 그리기
        ctx.drawImage(
            image,
            frameX * frameWidth, // 소스 x
            frameY * frameHeight, // 소스 y
            frameWidth, // 소스 너비
            frameHeight, // 소스 높이
            -width / 2, // 대상 x (중앙 기준)
            -height / 2, // 대상 y (중앙 기준)
            width, // 대상 너비
            height // 대상 높이
        );
        
        ctx.restore(); // 저장한 상태로 복원
    }
    
    /**
     * 스크롤링 배경 그리기
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     * @param {HTMLImageElement} image - 배경 이미지
     * @param {number} scrollSpeed - 스크롤 속도
     * @param {number} offset - 현재 오프셋
     * @param {number} canvasWidth - 캔버스 너비
     * @param {number} canvasHeight - 캔버스 높이
     * @returns {number} 새로운 오프셋 값
     */
    function drawScrollingBackground(ctx, image, scrollSpeed, offset, canvasWidth, canvasHeight) {
        const newOffset = (offset + scrollSpeed) % canvasWidth;
        
        // 이미지 두 개를 연속으로 그려서 무한 스크롤링 효과 생성
        ctx.drawImage(image, -newOffset, 0, canvasWidth, canvasHeight);
        ctx.drawImage(image, canvasWidth - newOffset, 0, canvasWidth, canvasHeight);
        
        return newOffset;
    }
    
    /**
     * 실시간 FPS 카운터 그리기
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     * @param {number} fps - 현재 FPS
     */
    function drawFPS(ctx, fps) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(`FPS: ${Math.round(fps)}`, 10, 20);
        ctx.restore();
    }
    
    /**
     * 텍스트 그리기 (그림자 효과 포함)
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     * @param {string} text - 표시할 텍스트
     * @param {number} x - x 좌표
     * @param {number} y - y 좌표
     * @param {string} fillStyle - 텍스트 색상
     * @param {string} font - 폰트 설정
     * @param {string} align - 텍스트 정렬
     * @param {string} shadowColor - 그림자 색상
     */
    function drawText(ctx, text, x, y, fillStyle = 'white', font = '20px Arial', align = 'center', shadowColor = 'rgba(0,0,0,0.5)') {
        ctx.save();
        
        // 텍스트 설정
        ctx.font = font;
        ctx.fillStyle = fillStyle;
        ctx.textAlign = align;
        
        // 그림자 효과
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // 텍스트 그리기
        ctx.fillText(text, x, y);
        
        ctx.restore();
    }
    
    /**
     * 둥근 모서리 직사각형 그리기
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     * @param {number} x - x 좌표
     * @param {number} y - y 좌표
     * @param {number} width - 너비
     * @param {number} height - 높이
     * @param {number} radius - 모서리 반경
     * @param {string} fillStyle - 채우기 색상
     * @param {string} strokeStyle - 테두리 색상
     * @param {number} lineWidth - 테두리 두께
     */
    function drawRoundRect(ctx, x, y, width, height, radius, fillStyle = null, strokeStyle = null, lineWidth = 1) {
        ctx.save();
        
        // 경로 시작
        ctx.beginPath();
        
        // 둥근 모서리 그리기
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        
        // 경로 닫기
        ctx.closePath();
        
        // 채우기 스타일 설정 및 적용
        if (fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }
        
        // 선 스타일 설정 및 적용
        if (strokeStyle) {
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    /**
     * 애니메이션 프레임 카운터
     * @param {number} frameCount - 현재 프레임 카운트
     * @param {number} frameDelay - 프레임 사이 딜레이
     * @param {number} totalFrames - 총 프레임 수
     * @returns {Object} 새 프레임 카운트와 현재 프레임 인덱스
     */
    function animationCounter(frameCount, frameDelay, totalFrames) {
        const newFrameCount = (frameCount + 1) % (frameDelay * totalFrames);
        const currentFrame = Math.floor(newFrameCount / frameDelay);
        
        return {
            frameCount: newFrameCount,
            currentFrame: currentFrame
        };
    }
    
    // 공개 API
    return {
        drawSprite,
        drawSpriteFrame,
        drawScrollingBackground,
        drawFPS,
        drawText,
        drawRoundRect,
        animationCounter
    };
})(); 