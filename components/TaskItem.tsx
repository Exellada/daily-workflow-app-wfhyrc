
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Task } from '../types';
import { IconSymbol } from './IconSymbol';
import { colors } from '../styles/commonStyles';
import i18n from '../localization';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  canEdit: boolean;
  showTime?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onComplete,
  onEdit,
  canEdit,
  showTime = true,
}) => {
  const handleComplete = () => {
    if (!task.completed) {
      onComplete(task.id);
    }
  };

  const handleEdit = () => {
    if (canEdit && onEdit) {
      onEdit(task);
    }
  };

  return (
    <View style={[styles.container, task.completed && styles.completedContainer]}>
      <Pressable
        style={styles.completeButton}
        onPress={handleComplete}
        disabled={task.completed}
      >
        <IconSymbol
          name={task.completed ? 'checkmark.circle.fill' : 'circle'}
          size={24}
          color={task.completed ? colors.accent : colors.text}
        />
      </Pressable>

      <View style={styles.content}>
        <Text style={[styles.title, task.completed && styles.completedText]}>
          {task.title}
        </Text>
        {task.description && (
          <Text style={[styles.description, task.completed && styles.completedText]}>
            {task.description}
          </Text>
        )}
        {showTime && (
          <Text style={styles.time}>
            {task.scheduledTime}
          </Text>
        )}
        {task.completedAt && task.completedBy && (
          <Text style={styles.completedInfo}>
            {i18n.t('completed')} {task.completedBy} в {task.completedAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>

      {canEdit && onEdit && (
        <Pressable style={styles.editButton} onPress={handleEdit}>
          <IconSymbol
            name="pencil"
            size={20}
            color={colors.text}
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  completedContainer: {
    opacity: 0.7,
    backgroundColor: colors.background,
  },
  completeButton: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  completedInfo: {
    fontSize: 12,
    color: colors.accent,
    fontStyle: 'italic',
    marginTop: 4,
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
});
