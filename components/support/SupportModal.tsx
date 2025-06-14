import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { TicketCategory } from '../../constants/supportTypes';
import KnowledgeBaseSearch from './KnowledgeBaseSearch';

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { subject: string; description: string; category: TicketCategory }) => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ visible, onClose, onSubmit }) => {
  const { colors, spacing, fontSizes } = useTheme();
  const [activeTab, setActiveTab] = useState('newTicket');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(TicketCategory.ACCOUNT);
  const [errors, setErrors] = useState<{ subject?: string; description?: string }>({});
  const [articleFound, setArticleFound] = useState(false);

  const resetForm = () => {
    setSubject('');
    setDescription('');
    setCategory(TicketCategory.ACCOUNT);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const newErrors: { subject?: string; description?: string } = {};
    
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Please provide more details (at least 10 characters)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    onSubmit({
      subject,
      description,
      category,
    });
    
    resetForm();
    onClose();
  };

  const categoryOptions = [
    { label: 'Account', value: TicketCategory.ACCOUNT },
    { label: 'Billing', value: TicketCategory.BILLING },
    { label: 'Technical', value: TicketCategory.TECHNICAL },
    { label: 'Feature Request', value: TicketCategory.FEATURE_REQUEST },
    { label: 'Other', value: TicketCategory.OTHER },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.centeredView}
      >
        <View style={[styles.modalView, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.headerText, { color: colors.text }]}>Support</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <AntDesign name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'newTicket' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveTab('newTicket')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'newTicket' ? colors.primary : colors.textSecondary },
                ]}
              >
                New Ticket
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'selfService' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveTab('selfService')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'selfService' ? colors.primary : colors.textSecondary },
                ]}
              >
                Self Help
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {activeTab === 'newTicket' ? (
              <View style={styles.form}>
                <View style={styles.formField}>
                  <Text style={[styles.label, { color: colors.text }]}>Subject</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { borderColor: errors.subject ? colors.error : colors.border },
                    ]}
                    value={subject}
                    onChangeText={(text) => {
                      setSubject(text);
                      if (errors.subject) setErrors({ ...errors, subject: undefined });
                    }}
                    placeholder="Brief description of your issue"
                    placeholderTextColor={colors.textSecondary}
                  />
                  {errors.subject && (
                    <Text style={[styles.errorText, { color: colors.error }]}>{errors.subject}</Text>
                  )}
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                  <View style={styles.categoryContainer}>
                    {categoryOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.categoryOption,
                          {
                            backgroundColor: category === option.value ? colors.primary : colors.card,
                          },
                        ]}
                        onPress={() => setCategory(option.value)}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            { color: category === option.value ? '#fff' : colors.text },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                  <TextInput
                    style={[
                      styles.textarea,
                      { borderColor: errors.description ? colors.error : colors.border },
                    ]}
                    value={description}
                    onChangeText={(text) => {
                      setDescription(text);
                      if (errors.description) setErrors({ ...errors, description: undefined });
                    }}
                    placeholder="Detailed description of your issue"
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    textAlignVertical="top"
                    numberOfLines={5}
                  />
                  {errors.description && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {errors.description}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: colors.primary }]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Submit Ticket</Text>
                </TouchableOpacity>
              </View>
            ) : (              <View style={styles.selfService}>
                <KnowledgeBaseSearch
                  onEscalateToTicket={() => setActiveTab('newTicket')}
                  onArticleFound={setArticleFound}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  form: {
    paddingBottom: 24,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    minHeight: 120,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Self Service Styles
  selfService: {
    paddingBottom: 24,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 12,
    fontSize: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  createTicketButton: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 24,
  },
  createTicketButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SupportModal;
