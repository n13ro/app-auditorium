const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const path = require('path');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API endpoints
app.get('/api/classrooms', async (req, res) => {
  try {
    const now = new Date();
    const classrooms = await prisma.classroom.findMany({
      include: {
        schedules: {
          where: {
            endTime: {
              gt: now
            }
          }
        }
      }
    });

    // Добавляем статус занятости для каждой аудитории
    const classroomsWithStatus = classrooms.map(classroom => ({
      ...classroom,
      isAvailable: classroom.schedules.length === 0
    }));

    res.json(classroomsWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/classrooms', async (req, res) => {
  try {
    const { name, capacity } = req.body;
    const classroom = await prisma.classroom.create({
      data: {
        name,
        capacity: parseInt(capacity)
      }
    });
    res.json(classroom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавляем endpoint для удаления аудитории
app.delete('/api/classrooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Сначала удаляем все связанные записи расписания
    await prisma.schedule.deleteMany({
      where: {
        classroomId: parseInt(id)
      }
    });

    // Затем удаляем саму аудиторию
    await prisma.classroom.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/schedule', async (req, res) => {
  try {
    const { classroomId, startTime, endTime, subject, teacher, group } = req.body;
    const schedule = await prisma.schedule.create({
      data: {
        classroomId: parseInt(classroomId),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        subject,
        teacher,
        group
      }
    });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/schedule', async (req, res) => {
  try {
    const now = new Date();
    const schedules = await prisma.schedule.findMany({
      where: {
        endTime: {
          gt: now
        }
      },
      include: {
        classroom: true
      }
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

setInterval(async () => {
  try {
    const now = new Date();
    await prisma.schedule.deleteMany({
      where: {
        endTime: {
          lt: now
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up schedules:', error);
  }
}, 30000); // Проверка каждые 30 секунд

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 