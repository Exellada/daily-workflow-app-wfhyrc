
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput, Modal } from 'react-native';
import { colors } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import Button from './button';
import { useApp } from '../contexts/AppContext';
import { User, UserRole } from '../types';
import i18n from '../localization';

interface UserManagementProps {
  visible: boolean;
  onClose: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ visible, onClose }) => {
  const { appState, addUser, deleteUser, updateUser } = useApp();
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);

  const handleAddUser = async () => {
    if (!newUserName.trim() || !newUserPassword.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    if (newUserPassword.length < 4) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 4 символа');
      return;
    }

    setLoading(true);
    try {
      const success = await addUser(newUserName.trim(), newUserPassword, newUserRole);
      if (success) {
        setNewUserName('');
        setNewUserPassword('');
        setNewUserRole('user');
        setShowAddUser(false);
        Alert.alert('Успешно', 'Пользователь добавлен');
      } else {
        Alert.alert('Ошибка', 'Пользователь с таким именем уже существует');
      }
    } catch (error) {
      console.log('Error adding user:', error);
      Alert.alert('Ошибка', 'Не удалось добавить пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === '1') {
      Alert.alert('Ошибка', 'Нельзя удалить администратора по умолчанию');
      return;
    }

    Alert.alert(
      'Удалить пользователя',
      `Вы уверены, что хотите удалить пользователя "${user.name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => deleteUser(user.id),
        },
      ]
    );
  };

  const getRoleDisplayName = (role: UserRole) => {
    const roleNames = {
      admin: 'Администратор',
      user: 'Пользователь',
      viewer: 'Наблюдатель',
    };
    return roleNames[role];
  };

  const getRoleColor = (role: UserRole) => {
    const roleColors = {
      admin: colors.accent,
      user: '#4CAF50',
      viewer: '#FF9800',
    };
    return roleColors[role];
  };

  const UserItem: React.FC<{ user: User }> = ({ user }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '20' }]}>
            <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
              {getRoleDisplayName(user.role)}
            </Text>
          </View>
        </View>
        <Text style={styles.userDate}>
          Создан: {user.createdAt.toLocaleDateString('ru-RU')}
        </Text>
      </View>
      
      {user.id !== '1' && appState.currentUser.role === 'admin' && (
        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(user)}
        >
          <IconSymbol name="trash" size={18} color="#FF5252" />
        </Pressable>
      )}
    </View>
  );

  const RoleSelector: React.FC = () => (
    <View style={styles.roleSelector}>
      <Text style={styles.inputLabel}>Роль пользователя</Text>
      <View style={styles.roleButtons}>
        {(['admin', 'user', 'viewer'] as UserRole[]).map((role) => (
          <Pressable
            key={role}
            style={[
              styles.roleButton,
              newUserRole === role && styles.roleButtonActive,
            ]}
            onPress={() => setNewUserRole(role)}
          >
            <Text
              style={[
                styles.roleButtonText,
                newUserRole === role && styles.roleButtonTextActive,
              ]}
            >
              {getRoleDisplayName(role)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Управление пользователями</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="xmark" size={24} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Пользователи ({appState.users.length})
              </Text>
              {appState.currentUser.role === 'admin' && (
                <Button
                  onPress={() => setShowAddUser(true)}
                  size="sm"
                  style={styles.addButton}
                >
                  Добавить
                </Button>
              )}
            </View>

            {appState.users.map(user => (
              <UserItem key={user.id} user={user} />
            ))}
          </View>

          {showAddUser && appState.currentUser.role === 'admin' && (
            <View style={styles.addUserForm}>
              <Text style={styles.formTitle}>Добавить нового пользователя</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Имя пользователя</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Введите имя пользователя"
                  placeholderTextColor={colors.text + '60'}
                  value={newUserName}
                  onChangeText={setNewUserName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Пароль</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Введите пароль (минимум 4 символа)"
                  placeholderTextColor={colors.text + '60'}
                  value={newUserPassword}
                  onChangeText={setNewUserPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <RoleSelector />

              <View style={styles.formButtons}>
                <Button
                  onPress={() => {
                    setShowAddUser(false);
                    setNewUserName('');
                    setNewUserPassword('');
                    setNewUserRole('user');
                  }}
                  variant="outline"
                  style={styles.cancelButton}
                >
                  Отмена
                </Button>
                <Button
                  onPress={handleAddUser}
                  loading={loading}
                  style={styles.saveButton}
                >
                  Добавить
                </Button>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
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
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    paddingHorizontal: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 12,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  userDate: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  deleteButton: {
    padding: 8,
  },
  addUserForm: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  roleSelector: {
    marginBottom: 20,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.grey + '30',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: colors.accent + '20',
    borderColor: colors.accent,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  roleButtonTextActive: {
    color: colors.accent,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
