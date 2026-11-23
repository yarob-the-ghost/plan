const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const gradeInputs = document.querySelectorAll('.grade-input');
const progressBarEl = document.getElementById('progressBar');
const completedCountEl = document.getElementById('completedCount');
const averageGradeEl = document.getElementById('averageGrade');
const toastEl = document.getElementById('toastMessage');

let savedState = [];
try {
    const raw = localStorage.getItem('cleanSubjectsData');
    if (raw) {
        savedState = JSON.parse(raw);
    }
} catch (err) {
    savedState = [];
}

if (!Array.isArray(savedState) || savedState.length !== checkboxes.length) {
    savedState = Array.from({ length: checkboxes.length }, function () {
        return { completed: false, grade: '' };
    });
}

function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(function () {
        toastEl.classList.remove('show');
    }, 3000);
}

function updateStats() {
    const total = checkboxes.length;
    const completedCount = savedState.filter(function (item) {
        return item.completed;
    }).length;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    if (progressBarEl) {
        progressBarEl.style.width = percentage + '%';
    }
    if (completedCountEl) {
        completedCountEl.textContent = 'المواد المنجزة: ' + completedCount + ' / ' + total;
    }

    const gradedItems = savedState.filter(function (item) {
        return item.grade !== '' && !isNaN(item.grade);
    });

    if (averageGradeEl) {
        if (gradedItems.length > 0) {
            const sum = gradedItems.reduce(function (acc, item) {
                return acc + parseFloat(item.grade);
            }, 0);
            averageGradeEl.textContent = 'المعدل: ' + (sum / gradedItems.length).toFixed(2);
        } else {
            averageGradeEl.textContent = 'المعدل: 0';
        }
    }

    try {
        localStorage.setItem('cleanSubjectsData', JSON.stringify(savedState));
    } catch (err) {}
}

checkboxes.forEach(function (cb, idx) {
    if (savedState[idx] && savedState[idx].completed) {
        cb.checked = true;
        cb.closest('.subject-item').classList.add('completed');
    }

    cb.addEventListener('change', function (e) {
        savedState[idx].completed = e.target.checked;
        const card = e.target.closest('.subject-item');
        const name = card.querySelector('.subject-name').textContent;

        if (e.target.checked) {
            card.classList.add('completed');
            if (typeof confetti === 'function') {
                confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
            }
            showToast('مبروك! أتممت مادة "' + name + '" 🎉');
        } else {
            card.classList.remove('completed');
        }
        updateStats();
    });
});

gradeInputs.forEach(function (inp, idx) {
    if (savedState[idx] && savedState[idx].grade !== '') {
        inp.value = savedState[idx].grade;
    }

    inp.addEventListener('input', function (e) {
        savedState[idx].grade = e.target.value;
        updateStats();
    });
});

updateStats();