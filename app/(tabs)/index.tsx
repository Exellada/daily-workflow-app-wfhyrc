
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { TaskItem } from '@/components/TaskItem';
import { TaskEditor } from '@/components/TaskEditor';
import { AssignmentSelector } from '@/components/AssignmentSelector';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { Task } from '@/types';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import i18n from '@/localization';
import * as Haptics from 'expo-haptics';

export default function ChecklistScreen() {
  const {
    appState,
    completeTask,
    addTask,
    updateTask,
    deleteTask,
    getCurrentActiveTasks,
    loading,
  } = useApp();

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const activeTasks = getCurrentActiveTasks();
  const canEdit = appState.currentUser.role === 'admin';

  const handleCompleteTask = async (taskId: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeTask(taskId);
  };

  const handleEditTask = (task: Task) => {
    if (!canEdit) {
      Alert.alert(i18n.t('noPermission'), i18n.t('adminOnly'));
      return;
    }
    setEditingTask(task);
    setEditorVisible(true);
  };

  const handleAddTask = () => {
    if (!canEdit) {
      Alert.alert(i18n.t('noPermission'), i18n.t('adminOnly'));
      return;
    }
    setEditingTask(undefined);
    setEditorVisible(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed' | 'isActive'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setEditorVisible(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      i18n.t('delete'),
      'Вы уверены, что хотите удалить эту задачу?',
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('delete'),
          style: 'destructive',
          onPress: () => {
            deleteTask(taskId);
            setEditorVisible(false);
            setEditingTask(undefined);
          },
        },
      ]
    );
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, styles.loadingContainer]}>
        <Text style={commonStyles.text}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.timeText}>{formatCurrentTime()}</Text>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <RoleSwitcher />
          </View>

          <Text style={styles.resetInfo}>
            {i18n.t('resetAtMidnight')}
          </Text>
        </View>

        <AssignmentSelector />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Активные задачи ({activeTasks.length})
            </Text>
            {canEdit && (
              <Pressable style={styles.addButton} onPress={handleAddTask}>
                <IconSymbol name="plus" size={20} color={colors.background} />
              </Pressable>
            )}
          </View>

          {activeTasks.length > 0 ? (
            activeTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={handleCompleteTask}
                onEdit={canEdit ? handleEditTask : undefined}
                canEdit={canEdit}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="checkmark.circle" size={48} color={colors.accent} />
              <Text style={styles.emptyText}>
                {appState.tasks.some(t => !t.completed)
                  ? 'Ожидание активных задач...'
                  : 'Все задачи выполнены!'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Все задачи</Text>
          {appState.tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={handleCompleteTask}
              onEdit={canEdit ? handleEditTask : undefined}
              canEdit={canEdit}
            />
          ))}
        </View>
      </ScrollView>

      <TaskEditor
        visible={editorVisible}
        task={editingTask}
        onSave={handleSaveTask}
        onCancel={() => {
          setEditorVisible(false);
          setEditingTask(undefined);
        }}
        onDelete={editingTask ? handleDeleteTask : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.8,
    textTransform: 'capitalize',
  },
  resetInfo: {
    fontSize: 12,
    color: colors.accent,
    fontStyle: 'italic',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
    marginTop: 12,
    textAlign: 'center',
  },
});
