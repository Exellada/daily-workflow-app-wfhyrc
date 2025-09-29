
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Task } from '../types';
import { colors } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import i18n from '../localization';
import Button from './button';

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setScheduledTime(task.scheduledTime);
    } else {
      setTitle('');
      setDescription('');
      setScheduledTime('09:00');
    }
  }, [task, visible]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      scheduledTime,
    });
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
    }
  };

  const formatTime = (time: string) => {
    // Ensure time is in HH:MM format
    const cleaned = time.replace(/[^\d:]/g, '');
    const parts = cleaned.split(':');
    
    if (parts.length === 1 && parts[0].length <= 2) {
      return parts[0];
    }
    
    if (parts.length === 2) {
      const hours = parts[0].padStart(2, '0').slice(0, 2);
      const minutes = parts[1].padStart(2, '0').slice(0, 2);
      return `${hours}:${minutes}`;
    }
    
    return time;
  };

  const handleTimeChange = (text: string) => {
    const formatted = formatTime(text);
    setScheduledTime(formatted);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <IconSymbol name="xmark" size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.title}>
              {task ? i18n.t('editTask') : i18n.t('addTask')}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{i18n.t('taskTitle')}</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder={i18n.t('enterTaskTitle')}
                placeholderTextColor={colors.text + '60'}
                multiline={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{i18n.t('taskDescription')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder={i18n.t('enterTaskDescription')}
                placeholderTextColor={colors.text + '60'}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{i18n.t('scheduledTime')}</Text>
              <TextInput
                style={styles.timeInput}
                value={scheduledTime}
                onChangeText={handleTimeChange}
                placeholder="09:00"
                placeholderTextColor={colors.text + '60'}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              onPress={handleSave}
              disabled={!title.trim()}
              style={styles.saveButton}
            >
              {i18n.t('save')}
            </Button>

            {task && onDelete && (
              <Button
                onPress={handleDelete}
                variant="outline"
                style={styles.deleteButton}
              >
                {i18n.t('delete')}
              </Button>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '30',
  },
  cancelButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 36,
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.grey + '30',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  timeInput: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.grey + '30',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    width: 100,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  saveButton: {
    backgroundColor: colors.accent,
  },
  deleteButton: {
    borderColor: colors.accent,
  },
});
