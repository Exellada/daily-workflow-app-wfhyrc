
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import i18n from '@/localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { appState } = useApp();

  const handleClearData = () => {
    Alert.alert(
      'Очистить данные',
      'Вы уверены, что хотите удалить все данные приложения? Это действие нельзя отменить.',
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Успешно', 'Данные приложения очищены. Перезапустите приложение.');
            } catch (error) {
              console.log('Error clearing data:', error);
              Alert.alert('Ошибка', 'Не удалось очистить данные');
            }
          },
        },
      ]
    );
  };

  const SettingItem: React.FC<{
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }> = ({ icon, title, subtitle, onPress, rightElement }) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <IconSymbol name={icon as any} size={20} color={colors.text} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (
        onPress && <IconSymbol name="chevron.right" size={16} color={colors.text} />
      )}
    </Pressable>
  );

  return (
    <View style={commonStyles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{i18n.t('settings')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Пользователь</Text>
          
          <SettingItem
            icon="person.circle"
            title="Текущая роль"
            subtitle={appState.currentUser.name}
            rightElement={<RoleSwitcher />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статистика</Text>
          
          <SettingItem
            icon="list.bullet"
            title="Всего задач"
            subtitle={`${appState.tasks.length} задач в системе`}
          />
          
          <SettingItem
            icon="checkmark.circle"
            title="Выполнено задач"
            subtitle={`${appState.completedTasks.length} задач выполнено`}
          />
          
          <SettingItem
            icon="calendar"
            title="Последний сброс"
            subtitle={new Date(appState.lastResetDate).toLocaleDateString('ru-RU')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация</Text>
          
          <SettingItem
            icon="info.circle"
            title="О приложении"
            subtitle="Система управления рабочим процессом v1.0"
          />
          
          <SettingItem
            icon="clock"
            title="Время сброса"
            subtitle="Чек-лист сбрасывается каждый день в 23:00"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Данные</Text>
          
          <SettingItem
            icon="trash"
            title="Очистить все данные"
            subtitle="Удалить все задачи и настройки"
            onPress={handleClearData}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Приложение для управления рабочим процессом
          </Text>
          <Text style={styles.footerText}>
            Синхронизация данных происходит автоматически
          </Text>
        </View>
      </ScrollView>
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
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '20',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
});
