
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { UserManagement } from '@/components/UserManagement';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import i18n from '@/localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { appState, logout } = useApp();
  const [showUserManagement, setShowUserManagement] = useState(false);

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

  const handleLogout = () => {
    Alert.alert(
      'Выйти из системы',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: logout },
      ]
    );
  };

  const SettingItem: React.FC<{
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }> = ({ icon, title, subtitle, onPress, rightElement, danger = false }) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, danger && styles.dangerIconContainer]}>
          <IconSymbol 
            name={icon as any} 
            size={20} 
            color={danger ? '#FF5252' : colors.text} 
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
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
          <Text style={styles.sectionTitle}>Текущий пользователь</Text>
          
          <SettingItem
            icon="person.circle.fill"
            title={appState.currentUser.name}
            subtitle={`Роль: ${appState.currentUser.role === 'admin' ? 'Администратор' : 
                      appState.currentUser.role === 'user' ? 'Пользователь' : 'Наблюдатель'}`}
          />

          <SettingItem
            icon="arrow.triangle.2.circlepath"
            title="Переключить роль"
            subtitle="Временно изменить роль для тестирования"
            rightElement={<RoleSwitcher />}
          />

          <SettingItem
            icon="rectangle.portrait.and.arrow.right"
            title="Выйти из системы"
            subtitle="Вернуться к экрану входа"
            onPress={handleLogout}
          />
        </View>

        {appState.currentUser.role === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Управление</Text>
            
            <SettingItem
              icon="person.2"
              title="Управление пользователями"
              subtitle={`${appState.users.length} пользователей в системе`}
              onPress={() => setShowUserManagement(true)}
            />
          </View>
        )}

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

          <SettingItem
            icon="person.2.fill"
            title="Активные пользователи"
            subtitle={`${appState.users.filter(u => u.role !== 'viewer').length} пользователей могут выполнять задачи`}
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

          <SettingItem
            icon="lock.shield"
            title="Безопасность"
            subtitle="Аутентификация пользователей с паролями"
          />
        </View>

        {appState.currentUser.role === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Опасная зона</Text>
            
            <SettingItem
              icon="trash"
              title="Очистить все данные"
              subtitle="Удалить все задачи, пользователей и настройки"
              onPress={handleClearData}
              danger
            />
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Приложение для управления рабочим процессом
          </Text>
          <Text style={styles.footerText}>
            Данные сохраняются локально на устройстве
          </Text>
          <Text style={styles.footerText}>
            Версия 1.0 • Поддержка пользователей и ролей
          </Text>
        </View>
      </ScrollView>

      <UserManagement
        visible={showUserManagement}
        onClose={() => setShowUserManagement(false)}
      />
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
  dangerIconContainer: {
    backgroundColor: '#FF5252' + '20',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  dangerText: {
    color: '#FF5252',
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
