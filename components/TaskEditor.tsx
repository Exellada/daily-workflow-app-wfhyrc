
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Modal, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert 
} from 'react-native';
import Button from './button';
import { colors } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { Task } from '../types';
import { useApp } from '../contexts/AppContext';
import i18n from '../localization';

interface TaskEditorProps {
  visible: boolean;
  task?: Task;
  onSave: (taskData: Omit<Task, 'id' | 'completed' | 'isActive'>) => void;
  onCancel: () => void;
  onDelete?: (taskId: string) => void;
}

export const TaskEditor: React.FC<TaskEditorProps> = ({
  visible,
  task,
  onSave,
  onCancel,
  onDelete,
}) => {
  const { appState } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setScheduledTime(task.scheduledTime);
      setAssignedUsers(task.assignedUsers || []);
    } else {
      setTitle('');
      setDescription('');
      setScheduledTime('09:00');
      setAssignedUsers([]);
    }
  }, [task, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название задачи');
      return;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(scheduledTime)) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректное время в формате ЧЧ:ММ');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      scheduledTime,
      assignedUsers,
    });
  };

  const handleDelete = () => {
    if (task && onDelete) {
      Alert.alert(
        'Удалить задачу',
        'Вы уверены, что хотите удалить эту задачу?',
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Удалить',
            style: 'destructive',
            onPress: () => onDelete(task.id),
          },
        ]
      );
    }
  };

  const toggleUserAssignment = (userId: string) => {
    setAssignedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {task ? 'Редактировать задачу' : 'Новая задача'}
          </Text>
          <Pressable style={styles.closeButton} onPress={onCancel}>
            <IconSymbol name="xmark" size={24} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Название задачи *</Text>
              <TextInput
                style={styles.input}
                placeholder="Введите название задачи"
                placeholderTextColor={colors.text + '60'}
                value={title}
                onChangeText={setTitle}
                multiline
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Описание</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Введите описание задачи (необязательно)"
                placeholderTextColor={colors.text + '60'}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={300}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Время выполнения *</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.timeSelector}
                contentContainerStyle={styles.timeSelectorContent}
              >
                {timeOptions.map((time) => (
                  <Pressable
                    key={time}
                    style={[
                      styles.timeOption,
                      scheduledTime === time && styles.timeOptionSelected,
                    ]}
                    onPress={() => setScheduledTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        scheduledTime === time && styles.timeOptionTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Назначить пользователей ({assignedUsers.length})
              </Text>
              <Text style={styles.helperText}>
                Если никого не выбрать, задачу смогут выполнять все пользователи
              </Text>
              <View style={styles.usersList}>
                {appState.users.filter(user => user.role !== 'viewer').map((user) => (
                  <Pressable
                    key={user.id}
                    style={[
                      styles.userItem,
                      assignedUsers.includes(user.id) && styles.userItemSelected,
                    ]}
                    onPress={() => toggleUserAssignment(user.id)}
                  >
                    <View style={styles.userInfo}>
                      <Text style={[
                        styles.userName,
                        assignedUsers.includes(user.id) && styles.userNameSelected,
                      ]}>
                        {user.name}
                      </Text>
                      <Text style={styles.userRole}>
                        {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </Text>
                    </View>
                    {assignedUsers.includes(user.id) && (
                      <IconSymbol name="checkmark" size={20} color={colors.accent} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <Button
              onPress={onCancel}
              variant="outline"
              style={styles.cancelButton}
            >
              Отмена
            </Button>
            <Button
              onPress={handleSave}
              style={styles.saveButton}
            >
              {task ? 'Сохранить' : 'Создать'}
            </Button>
          </View>
          
          {task && onDelete && (
            <Button
              onPress={handleDelete}
              variant="outline"
              style={styles.deleteButton}
              textStyle={styles.deleteButtonText}
            >
              <IconSymbol name="trash" size={16} color="#FF5252" />
              {' '}Удалить задачу
            </Button>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '20',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.grey + '30',
    minHeight: 50,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeSelector: {
    maxHeight: 50,
  },
  timeSelectorContent: {
    paddingRight: 20,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  timeOptionSelected: {
    backgroundColor: colors.accent + '20',
    borderColor: colors.accent,
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  timeOptionTextSelected: {
    color: colors.accent,
  },
  usersList: {
    gap: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  userItemSelected: {
    backgroundColor: colors.accent + '10',
    borderColor: colors.accent,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  userNameSelected: {
    color: colors.accent,
  },
  userRole: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.grey + '20',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  deleteButton: {
    borderColor: '#FF5252',
  },
  deleteButtonText: {
    color: '#FF5252',
  },
});
