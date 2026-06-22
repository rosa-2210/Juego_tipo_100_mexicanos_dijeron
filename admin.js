/* ============================================
   100 Abogados Dijeron - Administración
   ============================================ */

const admin = {
    responseCount: 0,
    currentEditId: null,

    init() {
        this.setupEventListeners();
        this.renderSurveysList();
        this.updateCategoryFilter();
        this.renderHistory();
        this.updateStats();
        this.loadTheme();
        this.renderGameBridgePanel();
        setInterval(() => this.renderGameBridgePanel(), 1000);
        window.addEventListener('storage', () => this.renderGameBridgePanel());
    },

    setupEventListeners() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.navigate(view);
            });
        });

        document.getElementById('surveyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSurvey();
        });

        document.getElementById('addResponseBtn').addEventListener('click', () => {
            this.addResponseInput();
        });

        document.getElementById('searchSurveys').addEventListener('input', () => {
            this.renderSurveysList();
        });

        document.getElementById('filterCategory').addEventListener('change', () => {
            this.renderSurveysList();
        });

        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('fullscreenToggle').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        this.setupFormListeners();
    },

    setupFormListeners() {
        const questionInput = document.getElementById('surveyQuestion');
        const categoryInput = document.getElementById('surveyCategory');

        questionInput.addEventListener('input', () => {
            this.updatePreview();
        });

        categoryInput.addEventListener('input', () => {
            this.updatePreview();
        });
    },

    navigate(view) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

        document.getElementById(`${view}View`).classList.add('active');
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        if (view === 'surveys') {
            this.renderSurveysList();
        } else if (view === 'history') {
            this.renderHistory();
            this.updateStats();
        } else if (view === 'create') {
            // Si venimos desde "Editar", NO limpiamos el formulario.
            // Antes se limpiaba aquí y por eso editar se veía como crear una encuesta nueva.
            if (!this.currentEditId) this.clearForm();
        }
    },

    renderResponseInputs() {
        const grid = document.getElementById('responsesGrid');
        grid.innerHTML = '';
        this.responseCount = 0;

        for (let i = 0; i < 2; i++) {
            this.addResponseInput();
        }
    },

    addResponseInput() {
        if (this.responseCount >= 8) {
            ui.toast('Máximo 8 respuestas permitidas', 'warning');
            return;
        }

        this.responseCount++;
        const grid = document.getElementById('responsesGrid');
        const index = this.responseCount;

        const responseGroup = document.createElement('div');
        responseGroup.className = 'response-input-group';
        responseGroup.dataset.index = index;
        responseGroup.innerHTML = `
            <input type="text" class="response-text" placeholder="Respuesta ${index}" required>
            <input type="number" class="response-points" placeholder="Puntos" min="1" max="100" required>
            <button type="button" class="remove-response-btn" onclick="admin.removeResponseInput(${index})">×</button>
        `;

        grid.appendChild(responseGroup);

        const inputs = responseGroup.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updatePreview();
            });
        });

        this.updatePreview();
    },

    removeResponseInput(index) {
        const group = document.querySelector(`[data-index="${index}"]`);
        if (group) {
            group.remove();
            this.responseCount--;
            this.renumberResponses();
            this.updatePreview();
        }
    },

    renumberResponses() {
        const groups = document.querySelectorAll('.response-input-group');
        groups.forEach((group, idx) => {
            group.dataset.index = idx + 1;
            const numberSpan = group.querySelector('.response-number');
            if (numberSpan) {
                numberSpan.textContent = idx + 1;
            }
            const textInput = group.querySelector('.response-text');
            if (textInput) {
                textInput.placeholder = `Respuesta ${idx + 1}`;
            }
            const removeBtn = group.querySelector('.remove-response-btn');
            if (removeBtn) {
                removeBtn.setAttribute('onclick', `admin.removeResponseInput(${idx + 1})`);
            }
        });
    },

    getFormData() {
        const question = document.getElementById('surveyQuestion').value.trim();
        const category = document.getElementById('surveyCategory').value.trim() || 'General';

        const responses = [];
        document.querySelectorAll('.response-input-group').forEach((group, idx) => {
            const text = group.querySelector('.response-text').value.trim();
            const points = parseInt(group.querySelector('.response-points').value) || 0;

            if (text && points > 0) {
                responses.push({ text, points });
            }
        });

        return { question, category, responses };
    },

    validate() {
        const { question, responses } = this.getFormData();

        if (!question) {
            ui.toast('Ingresa una pregunta', 'error');
            return false;
        }

        if (responses.length < 2) {
            ui.toast('Mínimo 2 respuestas requeridas', 'error');
            return false;
        }

        if (responses.length > 8) {
            ui.toast('Máximo 8 respuestas permitidas', 'error');
            return false;
        }

        return true;
    },

    saveSurvey() {
        if (!this.validate()) return;

        const { question, category, responses } = this.getFormData();
        const surveys = Shared.getSurveys();

        if (this.currentEditId) {
            const editId = String(this.currentEditId);
            const index = surveys.findIndex(s => String(s.id) === editId);
            if (index !== -1) {
                surveys[index] = {
                    ...surveys[index],
                    question,
                    category,
                    responses,
                    updatedAt: new Date().toISOString()
                };
                ui.toast('Encuesta actualizada', 'success');
            }
            this.currentEditId = null;
        } else {
            const newSurvey = {
                id: Shared.generateId(),
                question,
                category,
                responses,
                createdAt: new Date().toISOString()
            };
            surveys.push(newSurvey);
            ui.toast('Encuesta guardada', 'success');
        }

        Shared.saveSurveys(surveys);
        localStorage.setItem('100abogados_surveys_last_update', String(Date.now()));
        this.clearForm();
        this.updatePreview();
        this.updateCategoryFilter();
        this.renderSurveysList();
        this.renderGameBridgePanel();

        // Al guardar o actualizar, regresamos automáticamente a la lista de preguntas registradas.
        this.navigate('surveys');
    },

    clearForm() {
        document.getElementById('surveyForm').reset();
        document.getElementById('surveyId').value = '';
        document.getElementById('formTitle').textContent = 'Crear Nueva Encuesta';
        this.renderResponseInputs();
        this.updatePreview();
        this.currentEditId = null;

        const submitBtn = document.querySelector('#surveyForm button[type="submit"]');
        submitBtn.textContent = 'Guardar Encuesta';
    },

    updatePreview() {
        const { question, responses } = this.getFormData();

        const previewQuestion = document.getElementById('previewQuestion');
        previewQuestion.textContent = question || 'Tu pregunta aparecerá aquí';

        const previewResponses = document.getElementById('previewResponses');
        if (responses.length === 0) {
            previewResponses.innerHTML = '<div class="preview-response"><span class="preview-response-text">Las respuestas aparecerán aquí</span></div>';
        } else {
            previewResponses.innerHTML = responses.map((r, idx) => `
                <div class="preview-response">
                    <span class="preview-response-text">${idx + 1}. ${r.text}</span>
                    <span class="preview-response-points">${r.points} pts</span>
                </div>
            `).join('');
        }
    },

    editSurvey(id) {
        const survey = Shared.getSurveys().find(s => String(s.id) === String(id));
        if (!survey) return;

        this.currentEditId = id;
        document.getElementById('surveyId').value = id;
        document.getElementById('formTitle').textContent = 'Editar Encuesta';
        document.getElementById('surveyQuestion').value = survey.question;
        document.getElementById('surveyCategory').value = survey.category;

        const grid = document.getElementById('responsesGrid');
        grid.innerHTML = '';
        this.responseCount = 0;

        survey.responses.forEach(response => {
            this.responseCount++;
            const index = this.responseCount;
            const responseGroup = document.createElement('div');
            responseGroup.className = 'response-input-group';
            responseGroup.dataset.index = index;

            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'response-text';
            textInput.placeholder = `Respuesta ${index}`;
            textInput.required = true;
            textInput.value = response.text || '';

            const pointsInput = document.createElement('input');
            pointsInput.type = 'number';
            pointsInput.className = 'response-points';
            pointsInput.placeholder = 'Puntos';
            pointsInput.min = '1';
            pointsInput.max = '100';
            pointsInput.required = true;
            pointsInput.value = response.points || '';

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-response-btn';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', () => this.removeResponseInput(index));

            responseGroup.appendChild(textInput);
            responseGroup.appendChild(pointsInput);
            responseGroup.appendChild(removeBtn);
            grid.appendChild(responseGroup);

            [textInput, pointsInput].forEach(input => {
                input.addEventListener('input', () => {
                    this.updatePreview();
                });
            });
        });

        this.updatePreview();

        const submitBtn = document.querySelector('#surveyForm button[type="submit"]');
        submitBtn.textContent = 'Actualizar Encuesta';

        this.navigate('create');
    },

    deleteSurvey(id) {
        if (confirm('¿Estás seguro de eliminar esta encuesta?')) {
            let surveys = Shared.getSurveys();
            surveys = surveys.filter(s => String(s.id) !== String(id));
            Shared.saveSurveys(surveys);
            localStorage.setItem('100abogados_surveys_last_update', String(Date.now()));
            ui.toast('Encuesta eliminada', 'success');
            this.renderSurveysList();
            this.updateCategoryFilter();
        }
    },

    duplicateSurvey(id) {
        const surveys = Shared.getSurveys();
        const survey = surveys.find(s => String(s.id) === String(id));
        if (survey) {
            const duplicate = {
                ...survey,
                id: Shared.generateId(),
                question: survey.question + ' (Copia)',
                createdAt: new Date().toISOString()
            };
            surveys.push(duplicate);
            Shared.saveSurveys(surveys);
            localStorage.setItem('100abogados_surveys_last_update', String(Date.now()));
            ui.toast('Encuesta duplicada', 'success');
            this.renderSurveysList();
            this.updateCategoryFilter();
        }
    },


    esc(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    },

    renderGameBridgePanel() {
        const surveysView = document.getElementById('surveysView');
        if (!surveysView) return;

        let panel = document.getElementById('gameBridgePanel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'gameBridgePanel';
            panel.className = 'card game-bridge-panel';
            panel.style.marginBottom = '18px';
            const title = surveysView.querySelector('.section-title');
            if (title && title.nextSibling) {
                title.parentNode.insertBefore(panel, title.nextSibling);
            } else {
                surveysView.prepend(panel);
            }
        }

        const openUsedPanels = new Set(
            Array.from(panel.querySelectorAll('details[data-used-key][open]'))
                .map(detail => detail.dataset.usedKey)
        );

        let live = null;
        try {
            live = JSON.parse(localStorage.getItem('100abogados_live_round') || 'null');
        } catch (_) {}

        let usedMap = {};
        try {
            usedMap = JSON.parse(localStorage.getItem('100abogados_team_used_surveys') || '{}');
        } catch (_) {}

        if (!live) {
            usedMap = {};
            localStorage.removeItem('100abogados_team_used_surveys');
        }

        const surveys = Shared.getSurveys();
        const byId = new Map(surveys.map(s => [String(s.id), s]));

        const liveHtml = live && live.survey ? `
            <div class="admin-live-round">
                <h3>Ronda en curso</h3>
                <p><strong>${this.esc(live.team1Name || 'Equipo A')}</strong> vs <strong>${this.esc(live.team2Name || 'Equipo B')}</strong> · Ronda ${this.esc(live.currentRound || '')}</p>
                <p><strong>Categoría:</strong> ${this.esc(live.survey.category || 'General')}</p>
                <p><strong>Pregunta:</strong> ${this.esc(live.survey.question || '')}</p>
                <div class="admin-live-answers">
                    ${(live.survey.responses || []).slice(0, 5).map((r, i) => `
                        <div class="survey-response-preview ${live.revealed?.includes(i) ? 'revealed-admin-answer' : ''}">
                            <span class="survey-response-text">${i + 1}. ${this.esc(r.text)}</span>
                            <span class="survey-response-points">${this.esc(r.points)} pts</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : `
            <div class="admin-live-round">
                <h3>Ronda en curso</h3>
                <p style="color: var(--text-muted);">Todavía no hay una ronda activa. Cuando inicie una ronda, aquí aparecerán las respuestas.</p>
            </div>
        `;

        const usedEntries = Object.entries(usedMap);
        const usedHtml = usedEntries.length ? `
            <div class="admin-used-questions">
                <h3>Preguntas ya usadas por equipos</h3>
                ${usedEntries.map(([teamKey, ids]) => {
                    const items = (Array.isArray(ids) ? ids : [])
                        .map(id => byId.get(String(id)))
                        .filter(Boolean);
                    return `
                        <details data-used-key="${this.esc(teamKey)}" ${openUsedPanels.has(teamKey) ? 'open' : ''}>
                            <summary>${this.esc(teamKey)} · ${items.length} preguntas</summary>
                            ${items.length ? items.map(s => `
                                <div class="survey-response-preview">
                                    <span class="survey-response-text">${this.esc(s.category)} · ${this.esc(s.question)}</span>
                                </div>
                            `).join('') : '<p style="color: var(--text-muted);">Sin preguntas registradas.</p>'}
                        </details>
                    `;
                }).join('')}
            </div>
        ` : `
            <div class="admin-used-questions">
                <h3>Preguntas ya usadas por equipos</h3>
                <p style="color: var(--text-muted);">Aún no hay historial de preguntas usadas por equipos.</p>
            </div>
        `;

        panel.innerHTML = liveHtml + usedHtml;
    },

    renderSurveysList() {
        const searchTerm = (document.getElementById('searchSurveys')?.value || '').toLowerCase();
        const category = document.getElementById('filterCategory')?.value || '';

        let surveys = Shared.getSurveys();

        if (searchTerm) {
            surveys = surveys.filter(s => String(s.question || '').toLowerCase().includes(searchTerm));
        }

        if (category) {
            surveys = surveys.filter(s => s.category === category);
        }

        const list = document.getElementById('surveysList');
        list.innerHTML = '';

        if (surveys.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">▤</div>
                    <h3>No hay encuestas</h3>
                    <p>Crea tu primera encuesta</p>
                </div>
            `;
            return;
        }

        surveys.forEach((survey) => {
            const card = document.createElement('div');
            card.className = 'survey-card';

            const header = document.createElement('div');
            header.className = 'survey-card-header';

            const question = document.createElement('div');
            question.className = 'survey-question-preview';
            question.textContent = survey.question || '';

            const cat = document.createElement('span');
            cat.className = 'survey-category';
            cat.textContent = survey.category || 'General';

            header.appendChild(question);
            header.appendChild(cat);

            const preview = document.createElement('div');
            preview.className = 'survey-responses-preview';

            (survey.responses || []).slice(0, 3).forEach((r, idx) => {
                const row = document.createElement('div');
                row.className = 'survey-response-preview';

                const text = document.createElement('span');
                text.className = 'survey-response-text';
                text.textContent = `${idx + 1}. ${r.text || ''}`;

                const points = document.createElement('span');
                points.className = 'survey-response-points';
                points.textContent = `${r.points || 0} pts`;

                row.appendChild(text);
                row.appendChild(points);
                preview.appendChild(row);
            });

            if ((survey.responses || []).length > 3) {
                const more = document.createElement('div');
                more.style.textAlign = 'center';
                more.style.color = 'var(--text-muted)';
                more.style.fontSize = '0.85rem';
                more.textContent = `+${survey.responses.length - 3} más`;
                preview.appendChild(more);
            }

            const actions = document.createElement('div');
            actions.className = 'survey-card-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-secondary';
            editBtn.type = 'button';
            editBtn.textContent = 'Editar';
            editBtn.addEventListener('click', () => this.editSurvey(survey.id));

            const duplicateBtn = document.createElement('button');
            duplicateBtn.className = 'btn btn-secondary';
            duplicateBtn.type = 'button';
            duplicateBtn.textContent = 'Duplicar';
            duplicateBtn.addEventListener('click', () => this.duplicateSurvey(survey.id));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger';
            deleteBtn.type = 'button';
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.addEventListener('click', () => this.deleteSurvey(survey.id));

            actions.appendChild(editBtn);
            actions.appendChild(duplicateBtn);
            actions.appendChild(deleteBtn);

            card.appendChild(header);
            card.appendChild(preview);
            card.appendChild(actions);
            list.appendChild(card);
        });
    },

    updateCategoryFilter() {
        const categories = Shared.getCategories();
        const filter = document.getElementById('filterCategory');
        const datalist = document.getElementById('categoryList');

        filter.innerHTML = '<option value="">Todas las categorías</option>';
        datalist.innerHTML = '';

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filter.appendChild(option);

            const dataOption = document.createElement('option');
            dataOption.value = cat;
            datalist.appendChild(dataOption);
        });
    },

    exportSurveys() {
        const surveys = Shared.getSurveys();
        Shared.exportToFile(surveys, `encuestas_100abogados_${new Date().toISOString().split('T')[0]}.json`);
        ui.toast('Encuestas exportadas', 'success');
    },

    async importSurveys(input) {
        try {
            const imported = await Shared.importFromFile(input);

            if (!Array.isArray(imported)) {
                throw new Error('Formato inválido');
            }

            imported.forEach(survey => {
                if (!survey.id || !survey.question || !survey.responses) {
                    throw new Error('Encuesta inválida');
                }
                survey.id = Shared.generateId();
            });

            const surveys = Shared.getSurveys();
            Shared.saveSurveys([...surveys, ...imported]);
            localStorage.setItem('100abogados_surveys_last_update', String(Date.now()));
            ui.toast(`${imported.length} encuestas importadas`, 'success');
            this.renderSurveysList();
            this.updateCategoryFilter();
        } catch (err) {
            ui.toast('Error al importar: ' + err.message, 'error');
        }
        input.value = '';
    },

    showGamePreview() {
        const { question, responses } = this.getFormData();

        if (!question || responses.length === 0) {
            ui.toast('Completa la pregunta y al menos una respuesta', 'warning');
            return;
        }

        document.getElementById('previewGameQuestion').textContent = question;

        const board = document.getElementById('previewGameBoard');
        const tiles = [];

        for (let i = 0; i < 8; i++) {
            const response = responses[i];
            if (response) {
                tiles.push(`
                    <div class="answer-tile revealed" data-index="${i}">
                        <span class="answer-hidden">${i + 1}</span>
                        <div class="answer-content" style="display: flex;">
                            <span class="answer-number">${i + 1}</span>
                            <span class="answer-text">${response.text}</span>
                            <span class="answer-points">${response.points}</span>
                        </div>
                    </div>
                `);
            } else {
                tiles.push(`<div class="answer-tile" style="visibility: hidden;"></div>`);
            }
        }

        board.innerHTML = tiles.join('');
        document.getElementById('previewModal').classList.add('active');
    },

    closePreviewModal() {
        document.getElementById('previewModal').classList.remove('active');
    },

    renderHistory() {
        const games = Shared.getGames();
        const tbody = document.getElementById('historyTableBody');

        if (games.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        No hay partidas registradas
                    </td>
                </tr>
            `;
            return;
        }

        const recentGames = games.slice(-20).reverse();
        tbody.innerHTML = recentGames.map(game => `
            <tr>
                <td>${Shared.formatDate(game.date)}</td>
                <td style="max-width: 300px;">${game.question}</td>
                <td>${game.team1Name}: ${game.team1Score}</td>
                <td>${game.team2Name}: ${game.team2Score}</td>
                <td style="color: var(--accent-blue); font-weight: 700;">${game.winner}</td>
            </tr>
        `).join('');
    },

    updateStats() {
        const games = Shared.getGames();
        const rounds = Shared.getRounds();

        document.getElementById('totalGamesStat').textContent = games.length;
        document.getElementById('totalRoundsStat').textContent = rounds.length;
    },

    clearHistory() {
        if (confirm('¿Estás seguro de limpiar todo el historial? Esta acción no se puede deshacer.')) {
            Shared.saveGames([]);
            Shared.saveRounds([]);
            ui.toast('Historial limpiado', 'success');
            this.renderHistory();
            this.updateStats();
        }
    },

    exportHistory() {
        const games = Shared.getGames();
        const rounds = Shared.getRounds();

        const data = {
            games,
            rounds,
            exportedAt: new Date().toISOString()
        };

        Shared.exportToFile(data, `historial_100abogados_${new Date().toISOString().split('T')[0]}.json`);
        ui.toast('Historial exportado', 'success');
    },

    loadTheme() {
        const settings = Shared.getSettings();
        if (settings.theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);

        const settings = Shared.getSettings();
        settings.theme = newTheme;
        Shared.saveSettings(settings);

        const icon = document.querySelector('#themeToggle');
        icon.textContent = newTheme === 'dark' ? '◐' : '◑';
    },

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error al activar pantalla completa:', err);
            });
        } else {
            document.exitFullscreen();
        }
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

document.addEventListener('DOMContentLoaded', () => {
    admin.init();
});
