// Элементы DOM
const ball = document.getElementById('ball');
const cylinder = document.getElementById('cylinder');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const calculateBtn = document.getElementById('calculate-btn');
const resultsSection = document.getElementById('results-section');
const newExperimentBtn = document.getElementById('new-experiment-btn');
const exportBtn = document.getElementById('export-btn');

// Элементы управления
const liquidSelect = document.getElementById('liquid');
const ballDensitySlider = document.getElementById('ball-density');
const ballRadiusSlider = document.getElementById('ball-radius');
const cylinderHeightSlider = document.getElementById('cylinder-height');
const measureDistanceSlider = document.getElementById('measure-distance');

// Элементы отображения значений
const liquidDensityDisplay = document.getElementById('liquid-density');
const liquidViscosityDisplay = document.getElementById('liquid-viscosity');
const ballDensityValue = document.getElementById('ball-density-value');
const ballRadiusValue = document.getElementById('ball-radius-value');
const cylinderHeightValue = document.getElementById('cylinder-height-value');
const measureDistanceValue = document.getElementById('measure-distance-value');
const ballSpeedDisplay = document.getElementById('ball-speed');
const ballTimeDisplay = document.getElementById('ball-time');
const resistanceForceDisplay = document.getElementById('resistance-force');

// Элементы результатов
const measuredSpeed = document.getElementById('measured-speed');
const calculatedViscosity = document.getElementById('calculated-viscosity');
const errorValue = document.getElementById('error-value');
const resultsTableBody = document.getElementById('results-table-body');

// Переменные эксперимента
let experimentActive = false;
let ballPosition = 0;
let ballSpeed = 0;
let measurementStart = false;
let startTime = 0;
let endTime = 0;
let measuredTime = 0;
let measurements = [];
let experimentCount = 0;

// Константы
const g = 9.81; // ускорение свободного падения, м/с²

// Данные о жидкостях: [плотность, вязкость, название]
const liquids = {
	'0.89': [1000, 0.89, 'Вода'],
	'1.5': [920, 1.5, 'Масло подсолнечное'],
	'8.5': [880, 8.5, 'Масло моторное'],
	'12.3': [1260, 12.3, 'Глицерин']
};

// Инициализация значений
function initializeValues() {
	updateLiquidDisplay();
	updateBallDensityDisplay();
	updateBallRadiusDisplay();
	updateCylinderHeightDisplay();
	updateMeasureDistanceDisplay();

	// Сброс позиции шарика
	ball.style.top = '5px';
	ballPosition = 0;

	// Сброс отображения скорости и времени
	ballSpeedDisplay.textContent = '0 м/с';
	ballTimeDisplay.textContent = '0 с';
	resistanceForceDisplay.textContent = '0 Н';
}

// Обновление отображения жидкости
function updateLiquidDisplay() {
	const selectedValue = liquidSelect.value;
	const liquidData = liquids[selectedValue];
	liquidDensityDisplay.textContent = `${liquidData[0]} кг/м³`;
	liquidViscosityDisplay.textContent = `${liquidData[1]} Па·с`;
}

// Обновление отображения плотности шарика
function updateBallDensityDisplay() {
	ballDensityValue.textContent = `${ballDensitySlider.value} кг/м³`;
}

// Обновление отображения радиуса шарика
function updateBallRadiusDisplay() {
	const radiusMm = ballRadiusSlider.value;
	ballRadiusValue.textContent = `${radiusMm} мм`;
}

// Обновление отображения высоты цилиндра
function updateCylinderHeightDisplay() {
	const height = cylinderHeightSlider.value;
	cylinder.style.height = `${height}px`;
	cylinderHeightValue.textContent = `${height} мм`;
}

// Обновление отображения измеряемого расстояния
function updateMeasureDistanceDisplay() {
	measureDistanceValue.textContent = `${measureDistanceSlider.value} мм`;
}

// Рассчитать скорость шарика в установившемся режиме
function calculateTerminalVelocity() {
	const liquidValue = liquidSelect.value;
	const liquidDensity = liquids[liquidValue][0];
	const ballDensity = parseFloat(ballDensitySlider.value);
	const ballRadius = parseFloat(ballRadiusSlider.value) / 1000; // переводим в метры

	// Формула Стокса для установившейся скорости
	const numerator = 2 * (ballDensity - liquidDensity) * g * Math.pow(ballRadius, 2);
	const denominator = 9 * parseFloat(liquidValue); // вязкость из выбранной жидкости
	const terminalVelocity = numerator / denominator;

	return Math.max(terminalVelocity, 0.01); // минимальная скорость для визуализации
}

// Рассчитать силу сопротивления
function calculateResistanceForce() {
	const liquidViscosity = parseFloat(liquidSelect.value);
	const ballRadius = parseFloat(ballRadiusSlider.value) / 1000; // переводим в метры

	// Сила Стокса: F = 6πηrv
	return 6 * Math.PI * liquidViscosity * ballRadius * ballSpeed;
}

// Запуск эксперимента
function startExperiment() {
	if (experimentActive) return;

	experimentActive = true;
	measurementStart = false;
	ballPosition = 0;
	ballSpeed = calculateTerminalVelocity();

	// Установка шарика в начальное положение
	ball.style.top = '5px';

	// Обновление отображения скорости
	ballSpeedDisplay.textContent = `${ballSpeed.toFixed(4)} м/с`;

	// Запуск анимации
	animateBall();

	// Обновление кнопки
	startBtn.innerHTML = '<i class="fas fa-pause"></i> Пауза';
	startBtn.style.backgroundColor = '#dc3545';
}

// Пауза эксперимента
function pauseExperiment() {
	experimentActive = false;

	// Обновление кнопки
	startBtn.innerHTML = '<i class="fas fa-play"></i> Продолжить';
	startBtn.style.backgroundColor = '#1e3c72';
}

// Сброс эксперимента
function resetExperiment() {
	experimentActive = false;
	measurementStart = false;
	ballPosition = 0;
	ballSpeed = 0;

	// Сброс позиции шарика
	ball.style.top = '5px';

	// Сброс отображения
	ballSpeedDisplay.textContent = '0 м/с';
	ballTimeDisplay.textContent = '0 с';
	resistanceForceDisplay.textContent = '0 Н';

	// Обновление кнопки
	startBtn.innerHTML = '<i class="fas fa-play"></i> Начать эксперимент';
	startBtn.style.backgroundColor = '#1e3c72';

	// Скрытие результатов
	resultsSection.style.display = 'none';

	// Сброс шага индикатора
	document.getElementById('step2').classList.add('active');
	document.getElementById('step3').classList.remove('active');
}

// Анимация движения шарика
function animateBall() {
	if (!experimentActive) return;

	// Получаем высоту цилиндра и измеряемое расстояние в пикселях
	const cylinderHeight = parseInt(cylinderHeightSlider.value);
	const measureDistance = parseInt(measureDistanceSlider.value);

	// Скорость в пикселях в секунду (1 пиксель = 1 мм)
	// Переводим м/с в мм/с (умножаем на 1000)
	const speedPxPerSec = ballSpeed * 1000;

	// Приращение позиции за кадр (при 60 FPS)
	const deltaPosition = speedPxPerSec / 60;

	// Обновляем позицию шарика
	ballPosition += deltaPosition;

	// Проверяем, начался ли замер
	if (!measurementStart && ballPosition > 50) {
		measurementStart = true;
		startTime = Date.now();
	}

	// Проверяем, закончился ли замер
	if (measurementStart && ballPosition > 50 + measureDistance) {
		measurementStart = false;
		endTime = Date.now();
		measuredTime = (endTime - startTime) / 1000; // переводим в секунды

		// Отображаем измеренное время
		ballTimeDisplay.textContent = `${measuredTime.toFixed(2)} с`;

		// Рассчитываем и отображаем силу сопротивления
		const resistanceForce = calculateResistanceForce();
		resistanceForceDisplay.textContent = `${resistanceForce.toFixed(6)} Н`;

		// Пауза эксперимента после замера
		pauseExperiment();
	}

	// Проверяем, достиг ли шарик дна
	if (ballPosition > cylinderHeight - 40) {
		pauseExperiment();
		return;
	}

	// Обновляем позицию шарика на экране
	ball.style.top = `${ballPosition}px`;

	// Продолжаем анимацию
	requestAnimationFrame(animateBall);
}

// Рассчитать вязкость по результатам эксперимента
function calculateViscosity() {
	if (measuredTime === 0) {
		alert('Сначала проведите эксперимент!');
		return;
	}

	// Получаем данные
	const liquidValue = liquidSelect.value;
	const liquidDensity = liquids[liquidValue][0];
	const trueViscosity = parseFloat(liquidValue);
	const ballDensity = parseFloat(ballDensitySlider.value);
	const ballRadius = parseFloat(ballRadiusSlider.value) / 1000; // переводим в метры
	const measureDistance = parseFloat(measureDistanceSlider.value) / 1000; // переводим в метры

	// Рассчитываем скорость
	const measuredVelocity = measureDistance / measuredTime;

	// Рассчитываем вязкость по формуле Стокса
	const viscosity = (2 / 9) * (ballDensity - liquidDensity) * g * Math.pow(ballRadius, 2) / measuredVelocity;

	// Рассчитываем погрешность
	const error = Math.abs((viscosity - trueViscosity) / trueViscosity) * 100;

	// Сохраняем измерение
	experimentCount++;
	measurements.push({
		number: experimentCount,
		distance: measureDistance,
		time: measuredTime,
		velocity: measuredVelocity,
		viscosity: viscosity,
		error: error
	});

	// Обновляем отображение результатов
	updateResultsDisplay(measuredVelocity, viscosity, error);

	// Обновляем таблицу
	updateResultsTable();

	// Показываем секцию результатов
	resultsSection.style.display = 'block';

	// Обновляем шаг индикатора
	document.getElementById('step2').classList.remove('active');
	document.getElementById('step3').classList.add('active');
	document.getElementById('step3').classList.remove('completed');
}

// Обновление отображения результатов
function updateResultsDisplay(velocity, viscosity, error) {
	measuredSpeed.textContent = velocity.toFixed(4);
	calculatedViscosity.textContent = viscosity.toFixed(3);
	errorValue.textContent = error.toFixed(2);
}

// Обновление таблицы результатов
function updateResultsTable() {
	// Очищаем таблицу
	resultsTableBody.innerHTML = '';

	// Заполняем таблицу данными
	measurements.forEach(measurement => {
		const row = document.createElement('tr');
		row.innerHTML = `
<td>${measurement.number}</td>
<td>${measurement.distance.toFixed(3)}</td>
<td>${measurement.time.toFixed(2)}</td>
<td>${measurement.velocity.toFixed(4)}</td>
<td>${measurement.viscosity.toFixed(3)}</td>
<td>${measurement.error.toFixed(2)}</td>
`;
		resultsTableBody.appendChild(row);
	});
}

// Экспорт данных
function exportData() {
	if (measurements.length === 0) {
		alert('Нет данных для экспорта!');
		return;
	}

	// Создаем CSV строку
	let csv = '№,Расстояние (м),Время (с),Скорость (м/с),Вязкость (Па·с),Погрешность (%)\n';

	measurements.forEach(measurement => {
		csv += `${measurement.number},${measurement.distance.toFixed(3)},${measurement.time.toFixed(2)},${measurement.velocity.toFixed(4)},${measurement.viscosity.toFixed(3)},${measurement.error.toFixed(2)}\n`;
	});

	// Добавляем информацию об условиях эксперимента
	const liquidValue = liquidSelect.value;
	const liquidData = liquids[liquidValue];
	const liquidName = liquidData[2];

	csv += `\nПараметры эксперимента:\n`;
	csv += `Жидкость: ${liquidName}\n`;
	csv += `Плотность жидкости: ${liquidData[0]} кг/м³\n`;
	csv += `Истинная вязкость: ${liquidData[1]} Па·с\n`;
	csv += `Плотность шарика: ${ballDensitySlider.value} кг/м³\n`;
	csv += `Радиус шарика: ${ballRadiusSlider.value} мм\n`;
	csv += `Ускорение свободного падения: ${g} м/с²\n`;

	// Создаем blob и скачиваем файл
	const blob = new Blob([csv], { type: 'text/csv' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'результаты_метод_стокса.csv';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

// Начать новый эксперимент
function newExperiment() {
	// Сбрасываем измерения
	measurements = [];
	experimentCount = 0;

	// Сбрасываем таблицу
	resultsTableBody.innerHTML = '';

	// Скрываем результаты
	resultsSection.style.display = 'none';

	// Сбрасываем эксперимент
	resetExperiment();
}

// Обработчики событий
liquidSelect.addEventListener('change', updateLiquidDisplay);
ballDensitySlider.addEventListener('input', updateBallDensityDisplay);
ballRadiusSlider.addEventListener('input', updateBallRadiusDisplay);
cylinderHeightSlider.addEventListener('input', updateCylinderHeightDisplay);
measureDistanceSlider.addEventListener('input', updateMeasureDistanceDisplay);

startBtn.addEventListener('click', function() {
	if (experimentActive) {
		pauseExperiment();
	} else {
		startExperiment();
	}
});

resetBtn.addEventListener('click', resetExperiment);
calculateBtn.addEventListener('click', calculateViscosity);
newExperimentBtn.addEventListener('click', newExperiment);
exportBtn.addEventListener('click', exportData);

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', initializeValues);

// Добавление начальных данных в таблицу (пример)
function addExampleData() {

	// experimentCount = 3;

	// Обновляем таблицу
	updateResultsTable();

	// Обновляем отображение результатов
	updateResultsDisplay(0.0241, 0.92, 3.37);
}

// Добавляем пример данных при загрузке (для демонстрации)
setTimeout(addExampleData, 1000);