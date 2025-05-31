import { useState, useEffect } from 'react';
import axios from 'axios';
import { startOfWeek, addDays, format, isSameDay, parseISO } from 'date-fns';

function App() {
  const [activeSection, setActiveSection] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [noteInput, setNoteInput] = useState('');
  const [savedNotes, setSavedNotes] = useState(() => {
    const notes = localStorage.getItem('taskNotesList');
    return notes ? JSON.parse(notes) : [];
  });
  const [selectedNote, setSelectedNote] = useState(null);
  const [editTaskId, setEditTaskId] = useState(null);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');
  const [savedJournal, setSavedJournal] = useState(() => localStorage.getItem('journalEntry') || '');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [filter, setFilter] = useState('all');

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      localStorage.setItem('darkMode', !prev);
      return !prev;
    });
  };

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? '#121212' : '#ffffff';
    document.body.style.color = isDarkMode ? '#f0f0f0' : '#000000';
  }, [isDarkMode]);

  useEffect(() => {
    axios.get('http://localhost:5000/tasks')
      .then(res => setTasks(res.data))
      .catch(err => console.error('Error fetching tasks:', err));
  }, []);

   const handleDeleteTask = (id) => {
    axios.delete(`http://localhost:5000/tasks/${id}`)
      .then(() => setTasks(tasks.filter(task => task.id !== id)))
      .catch(err => console.error('Error deleting task:', err));
  };

  const handleToggleTaskCompletion = (task) => {
    const updatedTask = { ...task, completed: !task.completed };
    axios.put(`http://localhost:5000/tasks/${task.id}`, updatedTask)
      .then(res => setTasks(tasks.map(t => t.id === task.id ? res.data : t)))
      .catch(err => console.error('Error updating task completion:', err));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    if (filter === 'high') return task.priority === 'High';
    if (filter === 'medium') return task.priority === 'Medium';
    if (filter === 'low') return task.priority === 'Low';
    return true;
  });

  const renderTaskList = () => (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Filter:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
  {filteredTasks.map(task => (
    <li key={task.id} style={{ marginBottom: '1rem', background: '#f4f4f4', padding: '1rem', borderRadius: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={task.completed} onChange={() => toggleTaskCompletion(task)} />
          <span style={{ textDecoration: task.completed ? 'line-through' : 'none', fontWeight: 'bold' }}>{task.title}</span>
        </label>
        <div>
          <button onClick={() => handleEditTask(task)} style={{ marginLeft: '0.5rem' }}>✏️</button>
          <button onClick={() => handleDeleteTask(task.id)} style={{ marginLeft: '0.5rem', color: 'red' }}>🗑️</button>
        </div>
      </div>
      <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem' }}>
        Priority: {task.priority} | Reminder: {task.reminder_time ? format(parseISO(task.reminder_time), 'PPpp') : 'None'}
      </div>
    </li>
  ))}
</ul>
    </>
  );



  useEffect(() => {
    let timer;
    if (isRunning && pomodoroTime > 0) {
      timer = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsRunning(false);
      alert("Pomodoro finished! Take a break.");
    }
    return () => clearInterval(timer);
  }, [isRunning, pomodoroTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const taskData = {
      title: newTaskTitle,
      reminder_time: reminderTime || null,
      priority
    };

    if (editTaskId) {
      axios.put(`http://localhost:5000/tasks/${editTaskId}`, taskData)
        .then(res => {
          setTasks(tasks.map(t => t.id === editTaskId ? res.data : t));
          setEditTaskId(null);
          setNewTaskTitle('');
          setReminderTime('');
          setPriority('Medium');
          setFilter('all'); 
          
        }).catch(err => console.error('Error updating task:', err));
    } else {
      axios.post('http://localhost:5000/tasks', taskData)
        .then(res => {
          setTasks([...tasks, res.data]);
          setNewTaskTitle('');
          setReminderTime('');
          setPriority('Medium');
          setFilter('all'); 
        }).catch(err => console.error('Error adding task:', err));
    }
  };

  const handleEditTask = (task) => {
    setEditTaskId(task.id);
    setNewTaskTitle(task.title);
    setReminderTime(task.reminder_time ? task.reminder_time.slice(0, 16) : '');
    setPriority(task.priority || 'Medium');
  };

  const toggleTaskCompletion = (task) => {
    const updatedTask = {
      ...task,
      completed: !task.completed
    };

    axios.put(`http://localhost:5000/tasks/${task.id}`, updatedTask)
      .then(res => {
        setTasks(tasks.map(t => t.id === task.id ? res.data : t));
      })
      .catch(err => console.error('Error updating task completion:', err));
  };

  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    const updatedNotes = [...savedNotes, noteInput];
    setSavedNotes(updatedNotes);
    localStorage.setItem('taskNotesList', JSON.stringify(updatedNotes));
    setNoteInput('');
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = savedNotes.filter((_, i) => i !== index);
    setSavedNotes(updatedNotes);
    localStorage.setItem('taskNotesList', JSON.stringify(updatedNotes));
    if (selectedNote === savedNotes[index]) setSelectedNote(null);
  };

  const handleEditNote = (index) => {
    setNoteInput(savedNotes[index]);
    handleDeleteNote(index);
  };

  const handleSaveJournal = () => {
    if (journalEntry.trim()) {
      setSavedJournal(journalEntry);
      localStorage.setItem('journalEntry', journalEntry);
      setJournalEntry('');
    }
  };

  const getTasksForWeek = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dayTasks = tasks.filter(task =>
        task.reminder_time &&
        isSameDay(parseISO(task.reminder_time), date)
      );
      days.push({ date, tasks: dayTasks });
    }
    return days;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'tasks':
        return (
          <div style={{ flex: 1, padding: '2rem' }}>
            <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem', fontFamily: 'sans-serif' }}>✅ Tasks</h1>
            <p style={{ marginBottom: '1.5rem', fontStyle: 'italic', color: '#777' }}>
              "Small steps every day lead to big results."
            </p>

            <div style={{ marginBottom: '1rem' }}>
  <label style={{ marginRight: '0.5rem' }}>✨ Filter by Priority:</label>
  <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '0.3rem' }}>
    <option value="all">All</option>
    <option value="completed">Completed</option>
    <option value="incomplete">Incomplete</option>
    <option value="high">High Priority</option>
    <option value="medium">Medium Priority</option>
    <option value="low">Low Priority</option>
  </select>
</div>

            

            <form onSubmit={handleAddTask} style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Enter new task..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} style={{ padding: '0.5rem', flex: '1' }} />
              <input type="datetime-local" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} style={{ padding: '0.5rem' }} />
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: '0.5rem' }}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}>
                {editTaskId ? 'Update' : 'Add'}
              </button>
            </form>

            <ul style={{ listStyle: 'none', padding: 0 }}>
  {filteredTasks.map(task => (
                <li key={task.id} style={{ marginBottom: '1rem', background: '#f4f4f4', padding: '1rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" checked={task.completed} onChange={() => toggleTaskCompletion(task)} />
                      <span style={{ textDecoration: task.completed ? 'line-through' : 'none', fontWeight: 'bold' }}>{task.title}</span>
                    </label>
                    <div>
  <button onClick={() => handleEditTask(task)} style={{ marginLeft: '0.5rem' }}>✏️</button>
  <button onClick={() => handleDeleteTask(task.id)} style={{ marginLeft: '0.5rem', color: 'red' }}>🗑️</button>
</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem' }}>
                    Priority: {task.priority} | Reminder: {task.reminder_time ? format(parseISO(task.reminder_time), 'PPpp') : 'None'}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'calendar':
        return (
          <div style={{ flex: 1, padding: '2rem' }}>
            <h2>📅 Weekly Calendar</h2>
            {getTasksForWeek().map(({ date, tasks }) => (
              <div key={date} style={{ marginBottom: '1rem' }}>
                <strong>{format(date, 'EEE dd')}</strong>
                <ul style={{ marginLeft: '1rem' }}>
                  {tasks.length > 0 ? (
                    tasks.map(task => <li key={task.id}>• {task.title}</li>)
                  ) : (
                    <li style={{ color: '#888' }}>No tasks scheduled</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        );

      case 'notes':
        return (
          <div style={{ flex: 1, padding: '2rem' }}>
            <h2>🗒️ Notes</h2>
            <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} />
            <button onClick={handleSaveNote}>Save Note</button>
            <ul>
              {savedNotes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        );

      case 'journal':
        return (
          <div style={{ flex: 1, padding: '2rem' }}>
            <h2>📓 Journal</h2>
            <textarea value={journalEntry} onChange={(e) => setJournalEntry(e.target.value)} />
            <button onClick={handleSaveJournal}>Save Journal</button>
            {savedJournal && <p>{savedJournal}</p>}
          </div>
        );

      case 'pomodoro':
        return (
          <div style={{ flex: 1, padding: '2rem' }}>
            <h2>⏳ Pomodoro Timer</h2>
            <div>{formatTime(pomodoroTime)}</div>
            <button onClick={() => setIsRunning(!isRunning)}>{isRunning ? 'Pause' : 'Start'} Pomodoro</button>
          </div>
        );

      default:
        return (
          <div style={{ flex: 1, padding: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'cursive', fontSize: '2rem' }}>👋 Welcome to TaskNest!</h1>
            <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>Click any section from the sidebar to get started!</p>
          </div>
        );
    }
  };

  return (
    <>
      <button onClick={toggleDarkMode} style={{
        position: 'fixed', top: '1rem', right: '1rem', padding: '0.5rem 1rem',
        backgroundColor: isDarkMode ? '#f39c12' : '#2c3e50', color: 'white',
        border: 'none', borderRadius: '6px', cursor: 'pointer', zIndex: 999
      }}>
        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <div style={{
        display: 'flex', fontFamily: 'sans-serif',
        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
        color: isDarkMode ? '#f0f0f0' : '#000000', minHeight: '100vh'
      }}>
        <div style={{
          width: '150px', backgroundColor: isDarkMode ? '#2c2c2c' : '#f5f5f5',
          padding: '1.5rem 1rem 1rem 1rem', borderRight: '1px solid #ccc'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'cursive', fontSize: '1.4rem', margin: 0 }}>📝 TaskNest</h2>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', transform: 'translateY(-30px)' }}>
            <li style={{ textAlign: 'center', padding: '0.75rem 0', borderBottom: '1px solid #999' }}>
              <a href="#home" onClick={(e) => { e.preventDefault(); setActiveSection(''); }} style={{ color: isDarkMode ? '#f0f0f0' : '#000000', textDecoration: 'none' }}>🏠 Home</a>
            </li>
            <li style={{ textAlign: 'center', padding: '0.75rem 0', borderBottom: '1px solid #999' }}>
              <a href="#tasks" onClick={(e) => { e.preventDefault(); setActiveSection('tasks'); }} style={{ color: isDarkMode ? '#f0f0f0' : '#000000', textDecoration: 'none' }}>✅ Tasks</a>
            </li>
            <li style={{ textAlign: 'center', padding: '0.75rem 0', borderBottom: '1px solid #999' }}>
              <a href="#notes" onClick={(e) => { e.preventDefault(); setActiveSection('notes'); }} style={{ color: isDarkMode ? '#f0f0f0' : '#000000', textDecoration: 'none' }}>🗒️ Notes</a>
            </li>
            <li style={{ textAlign: 'center', padding: '0.75rem 0', borderBottom: '1px solid #999' }}>
              <a href="#calendar" onClick={(e) => { e.preventDefault(); setActiveSection('calendar'); }} style={{ color: isDarkMode ? '#f0f0f0' : '#000000', textDecoration: 'none' }}>📅 Calendar</a>
            </li>
            <li style={{ textAlign: 'center', padding: '0.75rem 0' }}>
              <a href="#reminders" onClick={(e) => { e.preventDefault(); setActiveSection('reminders'); }} style={{ color: isDarkMode ? '#f0f0f0' : '#000000', textDecoration: 'none' }}>🔔 Reminders</a>
            </li>
            <li style={{ textAlign: 'center', padding: '0.75rem 0', borderTop: '1px solid #999' }}>
              <a href="#pomodoro" onClick={(e) => { e.preventDefault(); setActiveSection('pomodoro'); }} style={{ color: isDarkMode ? '#f0f0f0' : '#000000', textDecoration: 'none' }}>⏳ Pomodoro</a>
            </li>
          </ul>
        </div>
        {renderContent()}
      </div>
    </>
  );
}

export default App;
