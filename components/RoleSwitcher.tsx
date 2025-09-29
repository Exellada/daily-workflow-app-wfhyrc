
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { UserRole } from '../types';
import { useApp } from '../contexts/AppContext';
import { colors } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import i18n from '../localization';

export const RoleSwitcher: React.FC = () => {
  const { appState, switchUserRole } = useApp();
  const [modalVisible, setModalVisible] = useState(false);

  const roles: { role: UserRole; label: string }[] = [
    { role: 'admin', label: i18n.t('admin') },
    { role: 'user', label: i18n.t('user') },
    { role: 'viewer', label: i18n.t('viewer') },
  ];

  const handleRoleSwitch = (role: UserRole) => {
    switchUserRole(role);
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <IconSymbol name="person.circle" size={20} color={colors.text} />
        <Text style={styles.buttonText}>
          {appState.currentUser.name}
        </Text>
        <IconSymbol name="chevron.down" size={16} color={colors.text} />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t('switchRole')}</Text>
            {roles.map(({ role, label }) => (
              <Pressable
                key={role}
                style={[
                  styles.roleOption,
                  appState.currentUser.role === role && styles.selectedRole,
                ]}
                onPress={() => handleRoleSwitch(role)}
              >
                <Text
                  style={[
                    styles.roleText,
                    appState.currentUser.role === role && styles.selectedRoleText,
                  ]}
                >
                  {label}
                </Text>
                {appState.currentUser.role === role && (
                  <IconSymbol name="checkmark" size={16} color={colors.accent} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  buttonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 20,
    minWidth: 200,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedRole: {
    backgroundColor: colors.accent + '20',
  },
  roleText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedRoleText: {
    color: colors.accent,
    fontWeight: '600',
  },
});
