
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import Button from './button';
import { useApp } from '../contexts/AppContext';
import i18n from '../localization';

export const LoginScreen: React.FC = () => {
  const { authenticateUser } = useApp();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите имя пользователя и пароль');
      return;
    }

    setLoading(true);
    try {
      const success = await authenticateUser(name.trim(), password);
      if (!success) {
        Alert.alert('Ошибка входа', 'Неверное имя пользователя или пароль');
      }
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при входе в систему');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setName('Администратор');
    setPassword('admin123');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <IconSymbol name="person.circle.fill" size={80} color={colors.accent} />
          <Text style={styles.title}>Вход в систему</Text>
          <Text style={styles.subtitle}>Управление рабочим процессом</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <IconSymbol name="person" size={20} color={colors.text} />
            <TextInput
              style={styles.input}
              placeholder="Имя пользователя"
              placeholderTextColor={colors.text + '80'}
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <IconSymbol name="lock" size={20} color={colors.text} />
            <TextInput
              style={styles.input}
              placeholder="Пароль"
              placeholderTextColor={colors.text + '80'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Button
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          >
            Войти
          </Button>

          <Button
            onPress={handleDemoLogin}
            variant="outline"
            style={styles.demoButton}
          >
            Демо вход (Администратор)
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            По умолчанию: Администратор / admin123
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.8,
    textAlign: 'center',
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    paddingVertical: 4,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  demoButton: {
    borderColor: colors.accent,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
    textAlign: 'center',
  },
});
