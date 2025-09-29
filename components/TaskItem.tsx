
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Task } from '../types';
import { IconSymbol } from './IconSymbol';
import { colors } from '../styles/commonStyles';
import { useApp } from '../contexts/AppContext';
import i18n from '../localization';

interface TaskItemProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  canEdit: boolean;
  canComplete?: boolean;
  showTime?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onComplete,
  onEdit,
  canEdit,
  canComplete = true,
  showTime = true,
}) => {
  const { appState, canUserCompleteTask } = useApp();
  
  const userCanComplete = canUserCompleteTask(task.id) && canComplete && onComplete;
  const isAssignedToCurrentUser = task.assignedUsers?.includes(appState.currentUser.id) || 
                                  !task.assignedUsers?.length;

  const handleComplete = () => {
    if (!task.completed && userCanComplete) {
      onComplete(task.id);
    }
  };

  const handleEdit = () => {
    if (canEdit && onEdit) {
      onEdit(task);
    }
  };

  const getTaskStatusColor = () => {
    if (task.completed) return colors.accent;
    if (task.isActive) return '#4CAF50';
    return colors.text;
  };

  const getTaskStatusIcon = () => {
    if (task.completed) return 'checkmark.circle.fill';
    if (task.isActive) return 'circle.fill';
    return 'circle';
  };

  return (
    <View style={[
      styles.container, 
      task.completed && styles.completedContainer,
      task.isActive && !task.completed && styles.activeContainer,
    ]}>
      <Pressable
        style={[
          styles.completeButton,
          !userCanComplete && styles.disabledButton,
        ]}
        onPress={handleComplete}
        disabled={task.completed || !userCanComplete}
      >
        <IconSymbol
          name={getTaskStatusIcon()}
          size={24}
          color={getTaskStatusColor()}
        />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, task.completed && styles.completedText]}>
            {task.title}
          </Text>
          {task.isActive && !task.completed && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>АКТИВНО</Text>
            </View>
          )}
        </View>

        {task.description && (
          <Text style={[styles.description, task.completed && styles.completedText]}>
            {task.description}
          </Text>
        )}

        <View style={styles.taskMeta}>
          {showTime && (
            <Text style={styles.time}>
              <IconSymbol name="clock" size={12} color={colors.accent} /> {task.scheduledTime}
            </Text>
          )}
          
          {task.assignedUsers && task.assignedUsers.length > 0 && (
            <Text style={styles.assignedUsers}>
              <IconSymbol name="person" size={12} color={colors.text} /> 
              {' '}Назначено: {task.assignedUsers.length} польз.
            </Text>
          )}
        </View>

        {task.completedAt && task.completedBy && (
          <View style={styles.completionInfo}>
            <IconSymbol name="checkmark.circle" size={14} color={colors.accent} />
            <Text style={styles.completedInfo}>
              Выполнено {task.completedBy} в {task.completedAt.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        )}

        {!userCanComplete && !task.completed && appState.currentUser.role !== 'viewer' && (
          <Text style={styles.noAccessText}>
            <IconSymbol name="lock" size={12} color="#FF5252" /> 
            {' '}Нет доступа к выполнению
          </Text>
        )}
      </View>

      {canEdit && onEdit && (
        <Pressable style={styles.editButton} onPress={handleEdit}>
          <IconSymbol
            name="pencil"
            size={18}
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
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  completedContainer: {
    opacity: 0.7,
    backgroundColor: colors.background,
  },
  activeContainer: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: colors.backgroundAlt,
  },
  completeButton: {
    marginRight: 12,
    marginTop: 2,
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    minWidth: 150,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    marginBottom: 8,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  assignedUsers: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  completionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  completedInfo: {
    fontSize: 12,
    color: colors.accent,
    fontStyle: 'italic',
    flex: 1,
  },
  noAccessText: {
    fontSize: 12,
    color: '#FF5252',
    marginTop: 4,
    fontStyle: 'italic',
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
    marginTop: -4,
  },
});
