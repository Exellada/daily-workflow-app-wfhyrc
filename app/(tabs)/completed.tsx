
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { CompletedTask } from '@/types';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import i18n from '@/localization';

export default function CompletedTasksScreen() {
  const { appState } = useApp();
  const [selectedDate, setSelectedDate] = useState<string>('all');

  // Group completed tasks by date
  const groupedTasks = appState.completedTasks.reduce((groups, task) => {
    const date = task.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
    return groups;
  }, {} as Record<string, CompletedTask[]>);

  const dates = Object.keys(groupedTasks).sort((a, b) => b.localeCompare(a));
  const filteredTasks = selectedDate === 'all' 
    ? appState.completedTasks 
    : groupedTasks[selectedDate] || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateString === today) return i18n.t('today');
    if (dateString === yesterday) return i18n.t('yesterday');
    
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const CompletedTaskItem: React.FC<{ task: CompletedTask }> = ({ task }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <IconSymbol name="checkmark.circle.fill" size={20} color={colors.accent} />
        <Text style={styles.taskTitle}>{task.title}</Text>
      </View>
      <Text style={styles.taskInfo}>
        {i18n.t('completed')} {task.completedBy} в{' '}
        {task.completedAt.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );

  return (
    <View style={commonStyles.wrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{i18n.t('completedTasks')}</Text>
          <Text style={styles.subtitle}>
            Всего выполнено: {appState.completedTasks.length}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateFilter}>
          <Pressable
            style={[
              styles.dateButton,
              selectedDate === 'all' && styles.selectedDateButton,
            ]}
            onPress={() => setSelectedDate('all')}
          >
            <Text
              style={[
                styles.dateButtonText,
                selectedDate === 'all' && styles.selectedDateButtonText,
              ]}
            >
              Все
            </Text>
          </Pressable>
          {dates.map(date => (
            <Pressable
              key={date}
              style={[
                styles.dateButton,
                selectedDate === date && styles.selectedDateButton,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  selectedDate === date && styles.selectedDateButtonText,
                ]}
              >
                {formatDate(date)}
              </Text>
              <Text style={styles.taskCount}>
                {groupedTasks[date].length}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
          {filteredTasks.length > 0 ? (
            filteredTasks
              .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
              .map(task => (
                <CompletedTaskItem key={task.id} task={task} />
              ))
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="tray" size={48} color={colors.text} />
              <Text style={styles.emptyText}>
                {i18n.t('noCompletedTasks')}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
  },
  dateFilter: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.grey + '30',
    alignItems: 'center',
  },
  selectedDateButton: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dateButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  selectedDateButtonText: {
    color: colors.background,
    fontWeight: '600',
  },
  taskCount: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  tasksList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskItem: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  taskInfo: {
    fontSize: 14,
    color: colors.accent,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
    marginTop: 12,
    textAlign: 'center',
  },
});
