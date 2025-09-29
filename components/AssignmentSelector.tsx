
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { DailyAssignment } from '../types';
import { useApp } from '../contexts/AppContext';
import { colors } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import i18n from '../localization';
import Button from './button';

export const AssignmentSelector: React.FC = () => {
  const { appState, setDailyAssignment, getResponsibleUsers } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [morningResponsible, setMorningResponsible] = useState('');
  const [eveningResponsible, setEveningResponsible] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayAssignment = appState.dailyAssignments.find(a => a.date === today);
  const responsibleUsers = getResponsibleUsers();

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

  const UserSelector: React.FC<{
    title: string;
    selectedUser: string;
    onSelect: (userId: string) => void;
  }> = ({ title, selectedUser, onSelect }) => (
    <View style={styles.selectorGroup}>
      <Text style={styles.selectorLabel}>{title}</Text>
      <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
        {responsibleUsers.map(user => (
          <Pressable
            key={user.id}
            style={[
              styles.userOption,
              selectedUser === user.id && styles.selectedUser,
            ]}
            onPress={() => onSelect(user.id)}
          >
            <View style={styles.userInfo}>
              <Text style={[
                styles.userText,
                selectedUser === user.id && styles.selectedUserText,
              ]}>
                {user.name}
              </Text>
              <Text style={styles.userRole}>
                {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
              </Text>
            </View>
            {selectedUser === user.id && (
              <IconSymbol name="checkmark" size={16} color={colors.accent} />
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const getAssignedUserName = (userId: string) => {
    const user = responsibleUsers.find(u => u.id === userId);
    return user ? user.name : userId;
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <IconSymbol name="person.2.fill" size={20} color={colors.accent} />
          <Text style={styles.title}>Ответственные на сегодня</Text>
        </View>
        
        {todayAssignment ? (
          <View style={styles.assignmentInfo}>
            <View style={styles.assignmentRow}>
              <IconSymbol name="sun.max" size={16} color="#FF9500" />
              <Text style={styles.periodLabel}>Утро:</Text>
              <Text style={styles.assignedUser}>
                {getAssignedUserName(todayAssignment.morningResponsible)}
              </Text>
            </View>
            <View style={styles.assignmentRow}>
              <IconSymbol name="moon" size={16} color="#5856D6" />
              <Text style={styles.periodLabel}>Вечер:</Text>
              <Text style={styles.assignedUser}>
                {getAssignedUserName(todayAssignment.eveningResponsible)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noAssignmentContainer}>
            <IconSymbol name="exclamationmark.triangle" size={20} color="#FF9500" />
            <Text style={styles.noAssignment}>Ответственные не назначены</Text>
          </View>
        )}

        {appState.currentUser.role === 'admin' && (
          <Pressable style={styles.editButton} onPress={openModal}>
            <IconSymbol name="pencil" size={16} color={colors.accent} />
            <Text style={styles.editButtonText}>
              {todayAssignment ? 'Изменить' : 'Назначить'}
            </Text>
          </Pressable>
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Назначить ответственных</Text>
            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <UserSelector
              title="Ответственный за утренние дела"
              selectedUser={morningResponsible}
              onSelect={setMorningResponsible}
            />

            <UserSelector
              title="Ответственный за вечерние дела"
              selectedUser={eveningResponsible}
              onSelect={setEveningResponsible}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              onPress={() => setModalVisible(false)}
              variant="outline"
              style={styles.modalButton}
            >
              Отмена
            </Button>
            <Button
              onPress={handleSave}
              disabled={!morningResponsible || !eveningResponsible}
              style={styles.modalButton}
            >
              Сохранить
            </Button>
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
    marginHorizontal: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  assignmentInfo: {
    gap: 8,
    marginBottom: 8,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    minWidth: 50,
  },
  assignedUser: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
    flex: 1,
  },
  noAssignmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  noAssignment: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.accent + '10',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  editButtonText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
    marginLeft: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '20',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  selectorGroup: {
    marginBottom: 24,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  userList: {
    maxHeight: 200,
  },
  userOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  selectedUser: {
    backgroundColor: colors.accent + '15',
    borderColor: colors.accent,
  },
  userInfo: {
    flex: 1,
  },
  userText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  selectedUserText: {
    color: colors.accent,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.grey + '20',
  },
  modalButton: {
    flex: 1,
  },
});
