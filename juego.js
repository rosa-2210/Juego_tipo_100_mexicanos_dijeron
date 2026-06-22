/* ============================================
   100 Abogados Dijeron - Juego TV
   ============================================ */

const game = {
    state: {
        survey: null,
        team1: { name: 'Equipo A', score: 0 },
        team2: { name: 'Equipo B', score: 0 },
        roundScores: { team1: 0, team2: 0 },
        revealed: [],
        team1Errors: 0,
        team2Errors: 0,
        stealForTeam: null,
        stealFromTeam: null,
        timer: null,
        timeLeft: 0,
        timerEnabled: false,
        active: false,
        roundEnding: false,
        currentRound: 1,
        totalRounds: 4,
        usedSurveyIds: [],
        roundHistory: []
    },

    correctAudio: null,
    incorrectAudio: null,
    startAudio: null,
    clockAudio: null,
    triumphAudio: null,
	
	showBigErrorX() {
    const bigX = document.getElementById('bigErrorX');
    if (!bigX) return;

    bigX.classList.remove('show');
    void bigX.offsetWidth;
    bigX.classList.add('show');

    setTimeout(() => {
        bigX.classList.remove('show');
    }, 1000);
},

    init() {
        Shared.ensureDefaultSurveys();
        this.resetAllUsedSurveys();

        this.correctAudio = this.createAudio('assets/sounds/respuesta_correcta.mp3');
        this.incorrectAudio = this.createAudio('assets/sounds/respuesta_incorrecta.mp3');
        this.startAudio = this.createAudio('assets/sounds/vamos_a_jugar.mp3');
        this.clockAudio = this.createAudio('assets/sounds/tiempo_reloj.mp3', true);
        this.triumphAudio = this.createAudio('assets/sounds/triunfo.mp3');

        this.setupEventListeners();
        this.loadTheme();
    },

    createAudio(src, loop = false) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.loop = loop;
        return audio;
    },

    playAudio(audio, volume = 0.95) {
        if (!audio) return;
        try {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = volume;
            audio.play().catch(() => {});
        } catch (e) {}
    },

    stopAudio(audio) {
        if (!audio) return;
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch (e) {}
    },

    stopRoundSounds() {
        this.stopAudio(this.clockAudio);
    },


    getTeamPairKey(team1Name = this.state.team1.name, team2Name = this.state.team2.name) {
        const names = [String(team1Name || 'Equipo A').trim(), String(team2Name || 'Equipo B').trim()]
            .map(n => n || 'Equipo')
            .sort((a, b) => a.localeCompare(b, 'es'));
        return names.join(' vs ');
    },

    getTeamUsedMap() {
        try {
            return JSON.parse(localStorage.getItem('100abogados_team_used_surveys') || '{}');
        } catch (_) {
            return {};
        }
    },

    saveTeamUsedMap(map) {
        localStorage.setItem('100abogados_team_used_surveys', JSON.stringify(map || {}));
    },

    getTeamUsedIds(team1Name, team2Name) {
        const map = this.getTeamUsedMap();
        const key = this.getTeamPairKey(team1Name, team2Name);
        return Array.isArray(map[key]) ? map[key].map(String) : [];
    },

    markTeamSurveyUsed(surveyId, team1Name, team2Name) {
        const map = this.getTeamUsedMap();
        const key = this.getTeamPairKey(team1Name, team2Name);
        if (!Array.isArray(map[key])) map[key] = [];
        const id = String(surveyId);
        if (!map[key].map(String).includes(id)) map[key].push(id);
        this.saveTeamUsedMap(map);
    },

    clearTeamUsedSurveys(team1Name, team2Name) {
        const map = this.getTeamUsedMap();
        const key = this.getTeamPairKey(team1Name, team2Name);
        delete map[key];
        this.saveTeamUsedMap(map);
    },

    resetAllUsedSurveys() {
        localStorage.removeItem('100abogados_team_used_surveys');
    },

    clearLiveRound() {
        localStorage.removeItem('100abogados_live_round');
    },

    publishLiveRound(status = 'active') {
        if (!this.state.survey) return;
        localStorage.setItem('100abogados_live_round', JSON.stringify({
            status,
            currentRound: this.state.currentRound,
            totalRounds: this.state.totalRounds,
            team1Name: this.state.team1.name,
            team2Name: this.state.team2.name,
            team1Score: this.state.team1.score,
            team2Score: this.state.team2.score,
            team1Errors: this.state.team1Errors,
            team2Errors: this.state.team2Errors,
            revealed: this.state.revealed,
            stealForTeam: this.state.stealForTeam,
            survey: {
                id: this.state.survey.id,
                question: this.state.survey.question,
                category: this.state.survey.category,
                responses: (this.state.survey.responses || []).slice(0, 5)
            },
            updatedAt: new Date().toISOString()
        }));
    },

    populateSetupOptions() {
        const categorySelect = document.getElementById('setupCategory');
        const questionSelect = document.getElementById('setupQuestionNumber');
        const randomCheckbox = document.getElementById('randomQuestion');
        const indicator = document.getElementById('surveyIndicator');

        if (!categorySelect || !questionSelect) return;

        const categories = Shared.getCategories();

        const previousCategory = categorySelect.value;
        categorySelect.innerHTML = '';

        if (!categories.length) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay categorías disponibles';
            categorySelect.appendChild(option);
            questionSelect.innerHTML = '<option value="">No hay preguntas disponibles</option>';
            if (indicator) indicator.textContent = 'Agrega preguntas desde Admin';
            return;
        }

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        if (previousCategory && categories.includes(previousCategory)) {
            categorySelect.value = previousCategory;
        } else if (categories.length) {
            categorySelect.value = categories[0];
        }

        if (randomCheckbox && !randomCheckbox.dataset.ready) {
            randomCheckbox.dataset.ready = '1';
            randomCheckbox.addEventListener('change', () => {
                questionSelect.disabled = randomCheckbox.checked;
            });
        }

        if (!categorySelect.dataset.ready) {
            categorySelect.dataset.ready = '1';
            categorySelect.addEventListener('change', () => this.updateQuestionOptions());
        }

        this.updateQuestionOptions();
    },

    updateQuestionOptions() {
        const categorySelect = document.getElementById('setupCategory');
        const questionSelect = document.getElementById('setupQuestionNumber');
        const randomCheckbox = document.getElementById('randomQuestion');
        const indicator = document.getElementById('surveyIndicator');
        if (!categorySelect || !questionSelect) return;

        const category = categorySelect.value;
        const wanted = Shared.normalize(category);
        const allSurveys = Shared.getSurveys();
        let surveys = allSurveys.filter(s =>
            s.responses &&
            s.responses.length >= 2 &&
            Shared.normalize(s.category) === wanted
        );
        if (!surveys.length && allSurveys.some(s => Shared.normalize(s.category) === wanted)) {
            surveys = allSurveys.filter(s =>
                s.responses &&
                Shared.normalize(s.category) === wanted
            );
        }

        const team1Name = document.getElementById('team1Name')?.value.trim() || 'Equipo A';
        const team2Name = document.getElementById('team2Name')?.value.trim() || 'Equipo B';
        const usedIds = this.getTeamUsedIds(team1Name, team2Name);
        const usedCount = usedIds.length;

        if (indicator) {
            indicator.textContent = `Ronda ${this.state.currentRound} de ${this.state.totalRounds} · ${category || 'Sin categoría'} · ${usedCount} pregunta(s) usada(s)`;
        }

        const previousValue = questionSelect.value;
        questionSelect.innerHTML = '';
        if (!surveys.length) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay preguntas en esta categoría';
            questionSelect.appendChild(option);
            questionSelect.disabled = true;
            return;
        }
        surveys.forEach((survey, idx) => {
            const option = document.createElement('option');
            option.value = survey.id;
            const wasUsed = usedIds.includes(String(survey.id)) ? ' · usada' : '';
            option.textContent = `${idx + 1}. ${survey.question}${wasUsed}`;
            questionSelect.appendChild(option);
        });

        if (previousValue && surveys.some(s => String(s.id) === previousValue)) {
            questionSelect.value = previousValue;
        }

        questionSelect.disabled = !!randomCheckbox?.checked;
    },

    selectSurveyFromSetup(team1Name, team2Name) {
        const categorySelect = document.getElementById('setupCategory');
        const questionSelect = document.getElementById('setupQuestionNumber');
        const randomCheckbox = document.getElementById('randomQuestion');

        // Categoría completamente dinámica: sale del selector, no de un orden fijo.
        // Si el admin creó una nueva categoría, aquí se usa tal cual.
        const selectedCategory = categorySelect?.value || '';
        if (!selectedCategory) {
            ui.toast('Selecciona una categoría antes de iniciar la ronda.', 'warning');
            return false;
        }
        const wanted = Shared.normalize(selectedCategory);
        const allSurveys = Shared.getSurveys();
        let surveys = allSurveys.filter(s =>
            s.responses &&
            s.responses.length >= 2 &&
            Shared.normalize(s.category) === wanted
        );
        if (!surveys.length && allSurveys.some(s => Shared.normalize(s.category) === wanted)) {
            surveys = allSurveys.filter(s =>
                s.responses &&
                Shared.normalize(s.category) === wanted
            );
        }

        if (!surveys.length) {
            ui.toast(`No hay preguntas disponibles de ${selectedCategory}.`, 'error');
            return false;
        }

        const usedIds = this.getTeamUsedIds(team1Name, team2Name);
        let survey = null;

        if (randomCheckbox?.checked !== false) {
            let available = surveys.filter(s => !usedIds.includes(String(s.id)));
            if (!available.length) {
                available = surveys.slice();
                ui.toast(`Ya se agotaron las preguntas de ${selectedCategory} para estos equipos. Se reinicia el ciclo.`, 'info');
            }
            survey = available[Math.floor(Math.random() * available.length)];
        } else {
            survey = surveys.find(s => String(s.id) === String(questionSelect?.value)) || surveys[0];
        }

        this.state.survey = survey;
        if (!this.state.usedSurveyIds.map(String).includes(String(survey.id))) this.state.usedSurveyIds.push(survey.id);
        if (survey && survey.id) this.markTeamSurveyUsed(survey.id, team1Name, team2Name);

        const indicator = document.getElementById('surveyIndicator');
        if (indicator) {
            const usedInCategory = surveys.filter(s => usedIds.includes(String(s.id))).length;
            const surveyNumber = surveys.findIndex(s => String(s.id) === String(survey.id)) + 1;
            indicator.textContent = `Ronda ${this.state.currentRound} de ${this.state.totalRounds} · ${selectedCategory} · Pregunta ${surveyNumber}/${surveys.length} · usadas ${usedInCategory}/${surveys.length}`;
        }

        return true;
    },


    refreshSetupOptionsIfVisible() {
        const setupScreen = document.getElementById('setupScreen');
        if (setupScreen?.classList.contains('active')) {
            this.populateSetupOptions();
        }
    },

    setupEventListeners() {
        const fs = document.getElementById('fullscreenToggle');
        if (fs) fs.addEventListener('click', () => this.toggleFullscreen());

        const enableTimer = document.getElementById('enableTimer');
        const timerSeconds = document.getElementById('timerSeconds');
        if (enableTimer) {
            enableTimer.checked = false;
            if (timerSeconds) timerSeconds.disabled = true;
            enableTimer.addEventListener('change', (e) => {
                if (timerSeconds) timerSeconds.disabled = !e.target.checked;
            });
        }

        ['team1Name', 'team2Name'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.addEventListener('input', () => this.updateQuestionOptions());
        });

        // Si el admin modifica/agrega/elimina preguntas mientras el juego está abierto,
        // refrescamos las categorías y preguntas disponibles en la pantalla de configuración.
        window.addEventListener('storage', (e) => {
            if (e.key === Shared.STORAGE_KEYS.SURVEYS || e.key === '100abogados_surveys_last_update') {
                this.refreshSetupOptionsIfVisible();
            }
        });
        window.addEventListener('focus', () => this.refreshSetupOptionsIfVisible());

        document.addEventListener('keydown', (e) => {
            const startScreen = document.getElementById('startScreen');
            if (e.key === 'Enter' && startScreen?.classList.contains('active')) this.goToInstructions();

            if (!this.state.active) return;
            if (e.key === '1') this.assignToTeam(1);
            if (e.key === '2') this.assignToTeam(2);
            if (e.key.toLowerCase() === 'z') this.assignError(1);
            if (e.key.toLowerCase() === 'x') this.assignError(2);
            if (e.key.toLowerCase() === 'q') this.assignResponse(0);
            if (e.key.toLowerCase() === 'w') this.assignResponse(1);
            if (e.key.toLowerCase() === 'e') this.assignResponse(2);
            if (e.key.toLowerCase() === 'r') this.assignResponse(3);
            if (e.key.toLowerCase() === 't') this.assignResponse(4);
        });
    },

    navigate(screenId) {
        ['startScreen', 'instructionsScreen', 'setupScreen', 'gameBoardScreen', 'resultsScreen'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.classList.toggle('active', id === screenId);
        });
    },

    goToInstructions() {
        this.playAudio(this.startAudio, 0.75);
        this.navigate('instructionsScreen');
    },

    goToSetup() {
        this.resetGameState(true);
        this.clearLiveRound();
        this.resetAllUsedSurveys();
        this.populateSetupOptions();
        this.navigate('setupScreen');
    },

    getRequiredCategoryForRound(round = this.state.currentRound) {
        // Ya no se fuerza Derecho/Cultura general. Se conserva solo por compatibilidad.
        const categories = Shared.getCategories ? Shared.getCategories() : [];
        return categories[0] || 'General';
    },

    getSurveyCycleKey(category) {
        return `abogados_used_cycle_${Shared.normalize(category).replace(/\s+/g, '_')}`;
    },

    getSurveyCycle(category) {
        try {
            return JSON.parse(localStorage.getItem(this.getSurveyCycleKey(category)) || '[]');
        } catch (e) {
            return [];
        }
    },

    saveSurveyCycle(category, ids) {
        localStorage.setItem(this.getSurveyCycleKey(category), JSON.stringify(ids));
    },

    selectRandomSurvey() {
        // Compatibilidad: antes aquí se forzaba Derecho/Cultura general.
        // Ahora toma la categoría seleccionada en la pantalla de configuración.
        const team1Name = document.getElementById('team1Name')?.value.trim() || this.state.team1.name || 'Equipo A';
        const team2Name = document.getElementById('team2Name')?.value.trim() || this.state.team2.name || 'Equipo B';
        this.populateSetupOptions();
        return this.selectSurveyFromSetup(team1Name, team2Name);
    },

    startRound() {
        const team1Name = document.getElementById('team1Name').value.trim() || 'Equipo A';
        const team2Name = document.getElementById('team2Name').value.trim() || 'Equipo B';

        if (!this.selectSurveyFromSetup(team1Name, team2Name)) return;
        const enableTimer = document.getElementById('enableTimer')?.checked || false;
        const timerSeconds = Math.max(5, Math.min(parseInt(document.getElementById('timerSeconds')?.value || '30', 10) || 30, 999));

        this.stopTimer();
        this.stopAudio(this.startAudio);
        this.stopAudio(this.triumphAudio);
        this.playAudio(this.clockAudio, 0.45);
        this.state.team1.name = team1Name;
        this.state.team2.name = team2Name;
        this.state.roundScores = { team1: 0, team2: 0 };
        this.state.revealed = [];
        this.state.team1Errors = 0;
        this.state.team2Errors = 0;
        this.state.stealForTeam = null;
        this.state.stealFromTeam = null;
        this.state.timeLeft = timerSeconds;
        this.state.timerEnabled = enableTimer;
        this.state.active = true;
        this.state.roundEnding = false;

        this.updateStaticBoardInfo();
        this.updateScores();
        this.renderBoard();
        this.updateRoundHint(enableTimer
            ? '<span id="revealedCount">0</span>/<span id="totalResponses">' + this.state.survey.responses.length + '</span> respuestas reveladas · al terminar el tiempo se muestran las faltantes'
            : '<span id="revealedCount">0</span>/<span id="totalResponses">' + this.state.survey.responses.length + '</span> respuestas reveladas · sin temporizador');
        this.updateRevealedCount();
        this.navigate('gameBoardScreen');
        this.publishLiveRound('active');

        if (enableTimer) this.startTimer();
        ui.toast(`¡Ronda ${this.state.currentRound} iniciada!`, 'success');
    },

    updateStaticBoardInfo() {
        document.getElementById('team1DisplayName').textContent = this.state.team1.name;
        document.getElementById('team2DisplayName').textContent = this.state.team2.name;
        document.getElementById('team1Errors').textContent = this.state.team1Errors;
        document.getElementById('team2Errors').textContent = this.state.team2Errors;
        document.getElementById('gameQuestion').textContent = this.state.survey.question;
        const category = document.getElementById('gameCategory');
        if (category) category.textContent = this.state.survey.category || 'General';
        const round = document.getElementById('roundIndicator');
        if (round) round.textContent = `${this.state.currentRound} / ${this.state.totalRounds}`;
        const timerDisplay = document.getElementById('timerDisplay');
        timerDisplay.classList.remove('warning');
        timerDisplay.style.display = this.state.timerEnabled ? 'block' : 'none';
        timerDisplay.style.minWidth = '150px';
        timerDisplay.style.width = 'auto';
        document.getElementById('timerValue').textContent = this.state.timerEnabled ? this.state.timeLeft : '--';
    },

    updateScores() {
        document.getElementById('team1Points').textContent = String(this.state.team1.score).padStart(3, '0');
        document.getElementById('team2Points').textContent = String(this.state.team2.score).padStart(3, '0');
    },

    renderBoard() {
        const board = document.getElementById('answersBoard');
        const responses = this.state.survey.responses.slice(0, 5);
        board.innerHTML = responses.map((response, i) => `
            <div class="answer-tile tv-answer-card" onclick="game.showAssignResponseModal(${i})" data-index="${i}">
                <div class="answer-card-inner">
                    <div class="answer-card-face answer-card-front">
                        <span class="answer-hidden">${i + 1}</span>
                    </div>
                    <div class="answer-card-face answer-card-back">
                        <span class="answer-number">${i + 1}</span>
                        <span class="answer-text"></span>
                        <span class="answer-points"></span>
                    </div>
                </div>
                <span class="answer-flash"></span>
            </div>`).join('');
        this.updateRevealedCount();
    },

	showAssignResponseModal(index) {
		if (!this.state.active || this.state.roundEnding || this.state.revealed.includes(index)) return;

		const response = this.state.survey.responses[index];
		if (!response) return;

		const pending = document.getElementById('pendingResponseIndex');
		const modalText = document.getElementById('modalResponseText');
		const modalPoints = document.getElementById('modalResponsePoints');
		const team1Btn = document.getElementById('assignTeam1Btn');
		const team2Btn = document.getElementById('assignTeam2Btn');
		const assignModal = document.getElementById('assignModal');

		if (pending) pending.value = String(index);
		if (modalText) modalText.textContent = response.text;
		if (modalPoints) modalPoints.textContent = `${response.points} puntos`;
		if (team1Btn) team1Btn.textContent = this.state.team1.name;
		if (team2Btn) team2Btn.textContent = this.state.team2.name;

		if (assignModal) {
			assignModal.classList.add('active');
		}
	},

    assignToTeam(team) {
        const indexEl = document.getElementById('pendingResponseIndex');
        if (!indexEl || indexEl.value === '') return;
        team = Number(team);
        if (this.state.stealForTeam && team !== this.state.stealForTeam) {
            ui.toast(`Solo puede responder ${this.state.stealForTeam === 1 ? this.state.team1.name : this.state.team2.name} por robo de puntos.`, 'warning');
            return;
        }
        this.assignResponse(parseInt(indexEl.value, 10), team, true);
        this.closeAssignModal();
    },

    assignResponse(index, team = null, addPoints = true) {
        if (this.state.revealed.includes(index)) return;
        const response = this.state.survey.responses[index];
        const tile = document.querySelector(`[data-index="${index}"]`);
        if (!response || !tile) return;

        this.state.revealed.push(index);
        tile.classList.add('revealing');
        const text = tile.querySelector('.answer-text');
        const points = tile.querySelector('.answer-points');
        if (text) text.textContent = response.text;
        if (points) points.textContent = response.points;

        setTimeout(() => tile.classList.add('revealed'), 40);
        setTimeout(() => tile.classList.remove('revealing'), 900);

        if (addPoints && team) {
            if (team === 1) {
                this.state.team1.score += response.points;
                this.state.roundScores.team1 += response.points;
            } else {
                this.state.team2.score += response.points;
                this.state.roundScores.team2 += response.points;
            }
            this.updateScores();
            const scoreEl = document.getElementById(`team${team}Points`);
            scoreEl.classList.add('scored');
            setTimeout(() => scoreEl.classList.remove('scored'), 500);

            if (this.state.stealForTeam === team) {
                ui.toast(`¡Robo conseguido para ${team === 1 ? this.state.team1.name : this.state.team2.name}!`, 'success');
                this.state.stealForTeam = null;
                this.state.stealFromTeam = null;
                this.state.team1Errors = 0;
                this.state.team2Errors = 0;
                document.getElementById('team1Errors').textContent = this.state.team1Errors;
                document.getElementById('team2Errors').textContent = this.state.team2Errors;
            }
        }

        this.playCorrectAudio();
        if (this.state.stealForTeam && team === this.state.stealForTeam) {
            this.state.stealForTeam = null;
            this.state.stealFromTeam = null;
            ui.toast('Robo resuelto. Ya pueden continuar normalmente.', 'success');
        }
        this.updateRevealedCount();
        this.publishLiveRound('active');

        if (this.state.revealed.length >= Math.min(5, this.state.survey.responses.length)) {
            this.finishRoundAutomatically('¡Todas las respuestas fueron reveladas!');
        }
    },

    playCorrectAudio() {
        this.playAudio(this.correctAudio, 0.95);
    },


    playIncorrectAudio() {
        this.playAudio(this.incorrectAudio, 0.95);
    },

    revealMissingAnswers() {
        const limit = Math.min(5, this.state.survey.responses.length);
        for (let i = 0; i < limit; i++) {
            if (!this.state.revealed.includes(i)) this.assignResponse(i, null, false);
        }
    },

    revealMissingManually() {
        if (!this.state.active) return;
        const limit = Math.min(5, this.state.survey.responses.length);
        const missing = [];

        for (let i = 0; i < limit; i++) {
            if (!this.state.revealed.includes(i)) missing.push(i);
        }

        if (!missing.length) {
            ui.toast('Todas las respuestas ya están reveladas.', 'info');
            return;
        }

        this.revealMissingAnswers();
        this.publishLiveRound('revealed_missing');
        this.updateRoundHint('Respuestas faltantes reveladas · revisa el tablero y presiona “Terminar ronda” cuando decidas.');
        ui.toast('Se revelaron las respuestas faltantes.', 'success');
    },

    finishRoundAutomatically(message) {
        if (this.state.roundEnding) return;
        this.state.roundEnding = true;
        this.stopTimer();
        this.stopRoundSounds();
        this.playAudio(this.triumphAudio, 0.85);
        this.publishLiveRound('round_ended');
        this.updateRoundHint(`${message} · revisa el tablero y presiona “Terminar ronda” cuando decidas.`);
        ui.toast(message, 'success');
    },

    closeAssignModal() {
        document.getElementById('assignModal')?.classList.remove('active');
        const pending = document.getElementById('pendingResponseIndex');
        if (pending) pending.value = '';
    },

    revealRandom() {
        if (!this.state.active) return;
        const limit = Math.min(5, this.state.survey.responses.length);
        const unrevealed = [];
        for (let i = 0; i < limit; i++) if (!this.state.revealed.includes(i)) unrevealed.push(i);
        if (!unrevealed.length) return ui.toast('Todas las respuestas están reveladas', 'warning');
        this.showAssignResponseModal(unrevealed[Math.floor(Math.random() * unrevealed.length)]);
    },

    showAssignErrorModal(team) {
        if (!this.state.active || this.state.roundEnding) return;
        if (team) return this.assignError(team);
        document.getElementById('assignErrorModal').classList.add('active');
        document.getElementById('errorTeam1Btn').textContent = this.state.team1.name;
        document.getElementById('errorTeam2Btn').textContent = this.state.team2.name;
    },

    assignError(team) {
        if (!this.state.active || this.state.roundEnding) return;
        team = Number(team);
        if (![1, 2].includes(team)) return;

        if (team === 1) {
            this.state.team1Errors++;
            document.getElementById('team1Errors').textContent = this.state.team1Errors;
        } else {
            this.state.team2Errors++;
            document.getElementById('team2Errors').textContent = this.state.team2Errors;
        }

		this.playIncorrectAudio();
		this.showBigErrorX();
        const errorBox = document.querySelector(`#team${team}Errors`)?.closest('.team-errors-clickable');
        if (errorBox) {
            errorBox.classList.add('error-hit');
            setTimeout(() => errorBox.classList.remove('error-hit'), 650);
        }

        const errorsNow = team === 1 ? this.state.team1Errors : this.state.team2Errors;
        const teamName = team === 1 ? this.state.team1.name : this.state.team2.name;

        if (errorsNow >= 3) {
            this.state.stealFromTeam = team;
            this.state.stealForTeam = team === 1 ? 2 : 1;
            ui.toast(`${teamName} llegó a 3 errores. La siguiente respuesta solo puede ser de ${this.state.stealForTeam === 1 ? this.state.team1.name : this.state.team2.name}.`, 'warning');
        } else {
            ui.toast(`Error para ${teamName} · X ${errorsNow}/3`, 'warning');
        }

        this.publishLiveRound('active');
        this.closeAssignErrorModal();
    },

    closeAssignErrorModal() {
        document.getElementById('assignErrorModal')?.classList.remove('active');
    },

    startTimer() {
        const timerDisplay = document.getElementById('timerDisplay');
        timerDisplay.style.display = 'block';
        timerDisplay.style.minWidth = '150px';
        timerDisplay.style.width = 'auto';
        timerDisplay.classList.remove('warning');
        document.getElementById('timerValue').textContent = this.state.timeLeft;
        this.state.timer = setInterval(() => {
            this.state.timeLeft--;
            document.getElementById('timerValue').textContent = this.state.timeLeft;
            if (this.state.timeLeft <= 10) timerDisplay.classList.add('warning');
            if (this.state.timeLeft <= 0) {
                this.stopTimer();
                this.state.roundEnding = true;
                ui.toast('¡Tiempo terminado! Se revelan las respuestas faltantes.', 'warning');
                this.revealMissingAnswers();
                this.stopRoundSounds();
                this.playAudio(this.triumphAudio, 0.85);
                this.updateRoundHint('Tiempo terminado · respuestas faltantes reveladas · presiona “Terminar ronda” cuando decidas.');
            }
        }, 1000);
    },

    stopTimer() {
        if (this.state.timer) clearInterval(this.state.timer);
        this.state.timer = null;
    },

    updateRevealedCount() {
        const revealedEl = document.getElementById('revealedCount');
        if (revealedEl) revealedEl.textContent = this.state.revealed.length;
    },

    updateRoundHint(message) {
        const hint = document.querySelector('.round-hint');
        if (hint) hint.innerHTML = message;
    },

    endRound(forced = false) {
        if (!this.state.active && !forced) return;
        this.publishLiveRound('round_finished');
        this.stopTimer();
        this.stopRoundSounds();
        this.playAudio(this.triumphAudio, 0.85);
        this.closeAssignModal();
        this.closeAssignErrorModal();
        this.state.active = false;

        const roundWinner = this.state.roundScores.team1 > this.state.roundScores.team2
            ? this.state.team1.name
            : this.state.roundScores.team2 > this.state.roundScores.team1
                ? this.state.team2.name
                : 'Empate';

        const roundRecord = {
            id: Shared.generateId(),
            surveyId: this.state.survey.id,
            round: this.state.currentRound,
            question: this.state.survey.question,
            team1Name: this.state.team1.name,
            team2Name: this.state.team2.name,
            team1Score: this.state.roundScores.team1,
            team2Score: this.state.roundScores.team2,
            totalTeam1: this.state.team1.score,
            totalTeam2: this.state.team2.score,
            winner: roundWinner,
            team1Errors: this.state.team1Errors,
            team2Errors: this.state.team2Errors,
            date: new Date().toISOString()
        };

        if (!this.state.roundHistory.some(r => r.round === roundRecord.round)) {
            this.state.roundHistory.push(roundRecord);
            Shared.addRound(roundRecord);
        }

        if (this.state.currentRound >= this.state.totalRounds) return this.showFinalResults();
        this.showRoundResults(roundWinner);
    },

    showRoundResults(winner) {
        document.querySelector('.results-card h2').textContent = `¡Ronda ${this.state.currentRound} Terminada!`;
        document.getElementById('finalTeam1Name').textContent = this.state.team1.name;
        document.getElementById('finalTeam1Score').textContent = this.state.team1.score;
        document.getElementById('finalTeam2Name').textContent = this.state.team2.name;
        document.getElementById('finalTeam2Score').textContent = this.state.team2.score;
        document.getElementById('winnerName').textContent = winner;
        document.querySelector('.results-actions').innerHTML = `
            <button class="btn btn-primary btn-large" onclick="game.nextRound()">Siguiente Ronda</button>
            <button class="btn btn-secondary btn-large" onclick="game.showFinalResults()">Ver Resultados</button>`;
        this.navigate('resultsScreen');
    },

    nextRound() {
        if (this.state.currentRound >= this.state.totalRounds) return this.showFinalResults();
        this.state.currentRound++;
        this.state.survey = null;
        this.populateSetupOptions();
        this.navigate('setupScreen');
    },

    showFinalResults() {
        this.clearLiveRound();
        this.stopTimer();
        this.stopRoundSounds();
        this.playAudio(this.triumphAudio, 0.85);
        const totalTeam1 = this.state.team1.score;
        const totalTeam2 = this.state.team2.score;
        const finalWinner = totalTeam1 > totalTeam2 ? this.state.team1.name : totalTeam2 > totalTeam1 ? this.state.team2.name : 'Empate';

        if (this.state.roundHistory.length) {
            Shared.addGame({
                id: Shared.generateId(),
                question: `Partida Completa (${this.state.roundHistory.length} rondas)`,
                team1Name: this.state.team1.name,
                team2Name: this.state.team2.name,
                team1Score: totalTeam1,
                team2Score: totalTeam2,
                winner: finalWinner,
                rounds: this.state.roundHistory,
                date: new Date().toISOString()
            });
        }
        this.clearTeamUsedSurveys(this.state.team1.name, this.state.team2.name);

        document.querySelector('.results-card h2').textContent = '🏆 ¡TENEMOS UN GANADOR!';
        document.getElementById('finalTeam1Name').textContent = this.state.team1.name;
        document.getElementById('finalTeam1Score').textContent = totalTeam1;
        document.getElementById('finalTeam2Name').textContent = this.state.team2.name;
        document.getElementById('finalTeam2Score').textContent = totalTeam2;
        document.getElementById('winnerName').textContent = finalWinner;
        document.querySelector('.results-actions').innerHTML = `
            <button class="btn btn-primary btn-large" onclick="game.restartGame()">Nueva Partida</button>
            <button class="btn btn-secondary btn-large" onclick="game.goToStart()">Inicio</button>`;
        this.navigate('resultsScreen');
    },

    resetGameState(keepNames = false) {
        this.stopTimer();
        this.stopRoundSounds();
        this.stopAudio(this.startAudio);
        this.stopAudio(this.triumphAudio);
        const team1Name = keepNames ? (document.getElementById('team1Name')?.value || 'Equipo A') : 'Equipo A';
        const team2Name = keepNames ? (document.getElementById('team2Name')?.value || 'Equipo B') : 'Equipo B';
        this.state = {
            survey: null,
            team1: { name: team1Name, score: 0 },
            team2: { name: team2Name, score: 0 },
            roundScores: { team1: 0, team2: 0 },
            revealed: [],
            team1Errors: 0,
            team2Errors: 0,
            stealForTeam: null,
            stealFromTeam: null,
            timer: null,
            timeLeft: 0,
            timerEnabled: false,
            active: false,
            roundEnding: false,
            currentRound: 1,
            totalRounds: 4,
            usedSurveyIds: [],
            roundHistory: []
        };
    },

    restartGame() {
        this.resetGameState(false);
        this.resetAllUsedSurveys();
        document.getElementById('team1Name').value = 'Equipo A';
        document.getElementById('team2Name').value = 'Equipo B';
        document.getElementById('enableTimer').checked = false;
        document.getElementById('timerSeconds').value = '30';
        document.getElementById('timerSeconds').disabled = true;
        this.stopRoundSounds();
        this.stopAudio(this.triumphAudio);
        document.querySelector('.results-card h2').textContent = '¡Ronda Terminada!';
        this.populateSetupOptions();
        this.navigate('setupScreen');
    },

    goToStart() {
        this.resetGameState(false);
        this.stopRoundSounds();
        this.stopAudio(this.triumphAudio);
        this.navigate('startScreen');
    },

    loadTheme() {
        const settings = Shared.getSettings();
        if (settings.theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    },

    toggleFullscreen() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen();
    }
};

const ui = {
    toast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => game.init());
