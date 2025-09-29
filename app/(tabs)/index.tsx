
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Dimensions } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { TaskItem } from '@/components/TaskItem';
import { TaskEditor } from '@/components/TaskEditor';
import { AssignmentSelector } from '@/components/AssignmentSelector';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { LoginScreen } from '@/components/LoginScreen';
import { Task } from '@/types';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import Button from '@/components/button';
import i18n from '@/localization';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

export default function ChecklistScreen() {
  const {
    appState,
    completeTask,
    addTask,
    updateTask,
    deleteTask,
    getCurrentActiveTasks,
    canUserCompleteTask,
    logout,
    loading,
  } = useApp();

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const activeTasks = useMemo(() => getCurrentActiveTasks(), [getCurrentActiveTasks]);
  const canEdit = useMemo(() => appState.currentUser.role === 'admin', [appState.currentUser.role]);
  const canComplete = useMemo(() => appState.currentUser.role !== 'viewer', [appState.currentUser.role]);

  const handleCompleteTask = useCallback(async (taskId: string) => {
    if (!canUserCompleteTask(taskId)) {
      Alert.alert('Нет доступа', 'У вас нет прав для выполнения этой задачи');
      return;
    }
    
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeTask(taskId);
  }, [canUserCompleteTask, completeTask]);

  const handleEditTask = useCallback((task: Task) => {
    if (!canEdit) {
      Alert.alert(i18n.t('noPermission'), i18n.t('adminOnly'));
      return;
    }
    setEditingTask(task);
    setEditorVisible(true);
  }, [canEdit]);

  const handleAddTask = useCallback(() => {
    if (!canEdit) {
      Alert.alert(i18n.t('noPermission'), i18n.t('adminOnly'));
      return;
    }
    setEditingTask(undefined);
    setEditorVisible(true);
  }, [canEdit]);

  const handleSaveTask = useCallback((taskData: Omit<Task, 'id' | 'completed' | 'isActive'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setEditorVisible(false);
    setEditingTask(undefined);
  }, [editingTask, updateTask, addTask]);

  const handleDeleteTask = useCallback((taskId: string) => {
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
  }, [deleteTask]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Выйти из системы',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: logout },
      ]
    );
  }, [logout]);

  const formatCurrentTime = useCallback(() => {
    return currentTime.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [currentTime]);

  const tasksToShow = useMemo(() => 
    showActiveOnly ? activeTasks : appState.tasks
  , [showActiveOnly, activeTasks, appState.tasks]);

  if (!appState.isAuthenticated) {
    return <LoginScreen />;
  }

  if (loading) {
    return (
      <View style={[commonStyles.container, styles.loadingContainer]}>
        <Text style={commonStyles.text}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.wrapper}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.timeContainer}>
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
            <View style={styles.headerControls}>
              <RoleSwitcher />
              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.currentUser}>
              Вошел как: {appState.currentUser.name}
            </Text>
            <Text style={styles.resetInfo}>
              {i18n.t('resetAtMidnight')}
            </Text>
          </View>
        </View>

        <AssignmentSelector />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {showActiveOnly ? `Активные задачи (${activeTasks.length})` : `Все задачи (${appState.tasks.length})`}
            </Text>
            <View style={styles.headerButtons}>
              <Button
                onPress={() => setShowActiveOnly(!showActiveOnly)}
                variant="outline"
                size="sm"
                style={styles.toggleButton}
              >
                {showActiveOnly ? 'Все' : 'Активные'}
              </Button>
              {canEdit && (
                <Button
                  onPress={handleAddTask}
                  size="sm"
                  style={styles.addButton}
                >
                  <IconSymbol name="plus" size={16} color={colors.background} />
                </Button>
              )}
            </View>
          </View>

          {tasksToShow.length > 0 ? (
            <View style={styles.tasksList}>
              {tasksToShow.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={canComplete ? handleCompleteTask : undefined}
                  onEdit={canEdit ? handleEditTask : undefined}
                  canEdit={canEdit}
                  canComplete={canUserCompleteTask(task.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol 
                name={showActiveOnly ? "clock" : "checkmark.circle"} 
                size={48} 
                color={colors.accent} 
              />
              <Text style={styles.emptyText}>
                {showActiveOnly 
                  ? (appState.tasks.some(t => !t.completed)
                      ? 'Ожидание активных задач...'
                      : 'Все задачи выполнены!')
                  : 'Нет задач'
                }
              </Text>
              {showActiveOnly && activeTasks.length === 0 && appState.tasks.some(t => !t.completed) && (
                <Button
                  onPress={() => setShowActiveOnly(false)}
                  variant="outline"
                  size="sm"
                  style={styles.viewAllButton}
                >
                  Посмотреть все задачи
                </Button>
              )}
            </View>
          )}
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
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  dateText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
  },
  userInfo: {
    marginTop: 8,
  },
  currentUser: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  resetInfo: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
    fontStyle: 'italic',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    minWidth: 200,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 16,
    borderColor: colors.accent,
  },
  addButton: {
    paddingHorizontal: 16,
    minWidth: 44,
  },
  tasksList: {
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
    marginTop: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    borderColor: colors.accent,
  },
});
