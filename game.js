// ===== 贪吃蛇小游戏 =====
(function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const startBtn = document.getElementById('startBtn');

    const gridSize = 20;
    const tileCount = canvas.width / gridSize; // 20

    let snake, food, dx, dy, score, gameRunning, gameLoopId;

    function initGame() {
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        food = { x: 15, y: 15 };
        dx = 1;
        dy = 0;
        score = 0;
        gameRunning = true;
        scoreEl.textContent = score;
        placeFood();
        draw();
    }

    function placeFood() {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        // 别让食物生成在蛇身上
        for (let seg of snake) {
            if (seg.x === food.x && seg.y === food.y) {
                placeFood();
                break;
            }
        }
    }

    function draw() {
        // 背景
        ctx.fillStyle = '#0a0f1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 网格线（淡）
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }

        // 食物（发光圆点）
        const foodX = food.x * gridSize + gridSize / 2;
        const foodY = food.y * gridSize + gridSize / 2;
        const gradient = ctx.createRadialGradient(foodX, foodY, 2, foodX, foodY, gridSize / 2);
        gradient.addColorStop(0, '#ec4899');
        gradient.addColorStop(1, '#be185d');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(foodX, foodY, gridSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // 蛇
        snake.forEach((seg, index) => {
            const x = seg.x * gridSize;
            const y = seg.y * gridSize;
            if (index === 0) {
                // 蛇头
                ctx.fillStyle = '#818cf8';
                ctx.shadowColor = '#6366f1';
                ctx.shadowBlur = 8;
            } else {
                // 蛇身渐变
                const ratio = index / snake.length;
                const r = Math.floor(99 + (129 - 99) * ratio);
                const g = Math.floor(102 + (140 - 102) * ratio);
                const b = Math.floor(241 + (241 - 241) * ratio);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.shadowBlur = 0;
            }
            ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
            ctx.shadowBlur = 0;

            // 蛇眼睛
            if (index === 0) {
                ctx.fillStyle = '#fff';
                const eyeSize = 3;
                ctx.fillRect(x + 5, y + 5, eyeSize, eyeSize);
                ctx.fillRect(x + 12, y + 5, eyeSize, eyeSize);
            }
        });

        // 游戏结束提示
        if (!gameRunning) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💀 Game Over', canvas.width / 2, canvas.height / 2 - 10);
            ctx.font = '16px sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('最终得分：' + score, canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('点击"开始游戏"再玩一次', canvas.width / 2, canvas.height / 2 + 45);
        }
    }

    function update() {
        if (!gameRunning) return;

        // 移动蛇
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // 撞墙检测
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameRunning = false;
            draw();
            return;
        }

        // 撞自己检测
        for (let seg of snake) {
            if (seg.x === head.x && seg.y === head.y) {
                gameRunning = false;
                draw();
                return;
            }
        }

        snake.unshift(head);

        // 吃食物
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreEl.textContent = score;
            placeFood();
        } else {
            snake.pop();
        }

        draw();
    }

    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (dy !== 1) { dx = 0; dy = -1; }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (dy !== -1) { dx = 0; dy = 1; }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (dx !== 1) { dx = -1; dy = 0; }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (dx !== -1) { dx = 1; dy = 0; }
                break;
        }
    });

    // 触屏滑动控制（手机友好）
    let touchStartX, touchStartY;
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); });
    canvas.addEventListener('touchend', (e) => {
        if (!gameRunning) return;
        const dx_t = e.changedTouches[0].clientX - touchStartX;
        const dy_t = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx_t) > Math.abs(dy_t)) {
            // 水平滑动
            if (dx_t > 0 && dx !== -1) { dx = 1; dy = 0; }
            else if (dx_t < 0 && dx !== 1) { dx = -1; dy = 0; }
        } else {
            // 垂直滑动
            if (dy_t > 0 && dy !== -1) { dx = 0; dy = 1; }
            else if (dy_t < 0 && dy !== 1) { dx = 0; dy = -1; }
        }
    });

    // 开始按钮
    startBtn.addEventListener('click', () => {
        clearInterval(gameLoopId);
        initGame();
        gameLoopId = setInterval(update, 120);
    });

    // 页面加载时先画一个初始画面
    initGame();
    gameRunning = false;
    draw();
})();
