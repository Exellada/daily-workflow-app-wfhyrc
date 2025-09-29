
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { DailyAssignment } from '../types';
import { useApp } from '../contexts/AppContext';
import { colors } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import i18n from '../localization';
import Button from './button';

export const AssignmentSelector: React.FC = () => {
  const { appState, setDailyAssignment } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [morningResponsible, setMorningResponsible] = useState('');
  const [eveningResponsible, setEveningResponsible] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayAssignment = appState.dailyAssignments.find(a => a.date === today);

  const users = ['Администратор', 'Пользователь 1', 'Пользователь 2', 'Пользователь 3'];

  const openModal = () => {
    setMorningResponsible(todayAssignment?.morningResponsible || '');
    setEveningResponsible(todayAssignment?.eveningResponsible || '');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (morningResponsible && eveningResponsible) {
      const assignment: DailyAssignment = {
        date: today,
        morningResponsible,
        eveningResponsible,
      };
      setDailyAssignment(assignment);
      setModalVisible(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>{i18n.t('assignResponsible')}</Text>
        
        {todayAssignment ? (
          <View style={styles.assignmentInfo}>
            <View style={styles.assignmentRow}>
              <Text style={styles.periodLabel}>{i18n.t('morning')}:</Text>
              <Text style={styles.assignedUser}>{todayAssignment.morningResponsible}</Text>
            </View>
            <View style={styles.assignmentRow}>
              <Text style={styles.periodLabel}>{i18n.t('evening')}:</Text>
              <Text style={styles.assignedUser}>{todayAssignment.eveningResponsible}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noAssignment}>Ответственные не назначены</Text>
        )}

        {appState.currentUser.role === 'admin' && (
          <Pressable style={styles.editButton} onPress={openModal}>
            <IconSymbol name="pencil" size={16} color={colors.text} />
            <Text style={styles.editButtonText}>{i18n.t('edit')}</Text>
          </Pressable>
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t('assignResponsible')}</Text>

            <View style={styles.selectorGroup}>
              <Text style={styles.selectorLabel}>{i18n.t('morningResponsible')}</Text>
              <View style={styles.userList}>
                {users.map(user => (
                  <Pressable
                    key={user}
                    style={[
                      styles.userOption,
                      morningResponsible === user && styles.selectedUser,
                    ]}
                    onPress={() => setMorningResponsible(user)}
                  >
                    <Text
                      style={[
                        styles.userText,
                        morningResponsible === user && styles.selectedUserText,
                      ]}
                    >
                      {user}
                    </Text>
                    {morningResponsible === user && (
                      <IconSymbol name="checkmark" size={16} color={colors.accent} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.selectorGroup}>
              <Text style={styles.selectorLabel}>{i18n.t('eveningResponsible')}</Text>
              <View style={styles.userList}>
                {users.map(user => (
                  <Pressable
                    key={user}
                    style={[
                      styles.userOption,
                      eveningResponsible === user && styles.selectedUser,
                    ]}
                    onPress={() => setEveningResponsible(user)}
                  >
                    <Text
                      style={[
                        styles.userText,
                        eveningResponsible === user && styles.selectedUserText,
                      ]}
                    >
                      {user}
                    </Text>
                    {eveningResponsible === user && (
                      <IconSymbol name="checkmark" size={16} color={colors.accent} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Button
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              >
                {i18n.t('cancel')}
              </Button>
              <Button
                onPress={handleSave}
                disabled={!morningResponsible || !eveningResponsible}
                style={styles.modalButton}
              >
                {i18n.t('save')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  assignmentInfo: {
    gap: 8,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    width: 60,
  },
  assignedUser: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  noAssignment: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
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
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  selectorGroup: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  userList: {
    gap: 4,
  },
  userOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  selectedUser: {
    backgroundColor: colors.accent + '20',
  },
  userText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedUserText: {
    color: colors.accent,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
});
