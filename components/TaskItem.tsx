
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Task } from '../types';
import { IconSymbol } from './IconSymbol';
import { colors } from '../styles/commonStyles';
import { useApp } from '../contexts/AppContext';
import * as Haptics from 'expo-haptics';

interface TaskItemProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  canEdit: boolean;
  canComplete?: boolean;
  showTime?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = memo(({
  task,
  onComplete,
  onEdit,
  canEdit,
  canComplete = true,
  showTime = true,
}) => {
  const { appState, canUserCompleteTask } = useApp();
  
  const userCanComplete = canUserCompleteTask(task.id) && canComplete && onComplete && !task.completed;
  const isAssignedToCurrentUser = task.assignedUsers?.includes(appState.currentUser.id) || 
                                  !task.assignedUsers?.length;

  const handleComplete = async () => {
    if (userCanComplete) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    return colors.text + '40';
  };

  const getTaskStatusIcon = () => {
    if (task.completed) return 'checkmark.circle.fill';
    if (userCanComplete) return 'circle';
    return 'circle.fill';
  };

  const getAssignedUsersText = () => {
    if (!task.assignedUsers?.length) return 'Все пользователи';
    
    const assignedNames = task.assignedUsers
      .map(userId => appState.users.find(u => u.id === userId)?.name)
      .filter(Boolean)
      .join(', ');
    
    return assignedNames || 'Назначенные пользователи';
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
        disabled={!userCanComplete}
      >
        <IconSymbol
          name={getTaskStatusIcon()}
          size={28}
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
            <View style={styles.metaItem}>
              <IconSymbol name="clock" size={14} color={colors.accent} />
              <Text style={styles.metaText}>{task.scheduledTime}</Text>
            </View>
          )}
          
          <View style={styles.metaItem}>
            <IconSymbol name="person" size={14} color={colors.text} />
            <Text style={styles.metaText}>{getAssignedUsersText()}</Text>
          </View>
        </View>

        {task.completedAt && task.completedBy && (
          <View style={styles.completionInfo}>
            <IconSymbol name="checkmark.circle" size={16} color={colors.accent} />
            <Text style={styles.completedInfo}>
              Выполнено {task.completedBy} в {task.completedAt.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        )}

        {!userCanComplete && !task.completed && appState.currentUser.role !== 'viewer' && (
          <View style={styles.noAccessInfo}>
            <IconSymbol name="lock" size={14} color="#FF5252" />
            <Text style={styles.noAccessText}>Нет доступа к выполнению</Text>
          </View>
        )}
      </View>

      {canEdit && onEdit && (
        <Pressable style={styles.editButton} onPress={handleEdit}>
          <IconSymbol name="pencil" size={18} color={colors.text} />
        </Pressable>
      )}
    </View>
  );
});

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
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButton: {
    marginRight: 12,
    marginTop: 2,
    padding: 4,
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
    marginBottom: 6,
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
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    marginBottom: 10,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.8,
    fontWeight: '500',
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
    backgroundColor: colors.accent + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedInfo: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
    flex: 1,
  },
  noAccessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  noAccessText: {
    fontSize: 12,
    color: '#FF5252',
    fontStyle: 'italic',
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
    marginTop: -4,
    borderRadius: 6,
  },
});
