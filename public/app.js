// API endpoints backend (server.js)
const API_URL = 'http://localhost:3001/api';

// DOM elements
const classroomsList = document.getElementById('classroomsList');
const scheduleList = document.getElementById('scheduleList');
const classroomSelect = document.getElementById('classroomSelect');

// Fetch and display classrooms
async function fetchClassrooms() {
    try {
        const response = await fetch(`${API_URL}/classrooms`);
        const classrooms = await response.json();
        
        // Update classrooms list
        classroomsList.innerHTML = classrooms.map(classroom => `
            <div class="classroom-item ${classroom.isAvailable ? 'available' : 'occupied'}">
                <h3>Аудитория ${classroom.name}</h3>
                <p>Вместимость: ${classroom.capacity} человек</p>
                <p>Статус: ${classroom.isAvailable ? 'Свободна' : 'Занята'}</p>
                <button onclick="deleteClassroom(${classroom.id})" class="delete-btn">Удалить аудиторию</button>
            </div>
        `).join('');

        // Update classroom select
        classroomSelect.innerHTML = classrooms.map(classroom => `
            <option value="${classroom.id}">Аудитория ${classroom.name}</option>
        `).join('');
    } catch (error) {
        console.error('Error fetching classrooms:', error);
    }
}

// Delete classroom
async function deleteClassroom(id) {
    if (!confirm('Вы уверены, что хотите удалить эту аудиторию?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/classrooms/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchClassrooms();
            fetchSchedule();
        }
    } catch (error) {
        console.error('Error deleting classroom:', error);
    }
}

// Fetch and display schedule
async function fetchSchedule() {
    try {
        const response = await fetch(`${API_URL}/schedule`);
        const schedules = await response.json();
        
        scheduleList.innerHTML = schedules.map(schedule => `
            <div class="schedule-item">
                <h3>${schedule.subject}</h3>
                <p>Аудитория: ${schedule.classroom.name}</p>
                <p>Группа: ${schedule.group}</p>
                <p>Преподаватель: ${schedule.teacher}</p>
                <p>Начало: ${new Date(schedule.startTime).toLocaleString()}</p>
                <p>Конец: ${new Date(schedule.endTime).toLocaleString()}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching schedule:', error);
    }
}

// Add new classroom
async function addClassroom() {
    const number = document.getElementById('classroomNumber').value;
    const capacity = document.getElementById('classroomCapacity').value;

    if (!number || !capacity) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/classrooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: number, capacity: parseInt(capacity) }),
        });

        if (response.ok) {
            document.getElementById('classroomNumber').value = '';
            document.getElementById('classroomCapacity').value = '';
            fetchClassrooms();
        }
    } catch (error) {
        console.error('Error adding classroom:', error);
    }
}

// Add new schedule
async function addSchedule() {
    const classroomId = document.getElementById('classroomSelect').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const subject = document.getElementById('subject').value;
    const teacher = document.getElementById('teacher').value;
    const group = document.getElementById('group').value;

    if (!classroomId || !startTime || !endTime || !subject || !teacher || !group) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                classroomId: parseInt(classroomId),
                startTime,
                endTime,
                subject,
                teacher,
                group
            }),
        });

        if (response.ok) {
            document.getElementById('startTime').value = '';
            document.getElementById('endTime').value = '';
            document.getElementById('subject').value = '';
            document.getElementById('teacher').value = '';
            document.getElementById('group').value = '';
            fetchSchedule();
            fetchClassrooms();
        }
    } catch (error) {
        console.error('Error adding schedule:', error);
    }
}

// Auto-reload 30 sec
setInterval(() => {
    fetchClassrooms();
    fetchSchedule();
}, 30000);

// Initial load
fetchClassrooms();
fetchSchedule(); 