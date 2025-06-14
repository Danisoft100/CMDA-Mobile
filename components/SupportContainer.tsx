import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { View } from 'react-native';
import SupportButton from './support/SupportButton';
import SupportModal from './support/SupportModal';
import { createTicket } from '../store/actions/supportActions';
import { TicketCategory } from '../constants/supportTypes';

interface Props {
  children: React.ReactNode;
}

interface TicketData {
  subject: string;
  description: string;
  category: TicketCategory;
}

const SupportContainer = ({ children }: Props) => {
  const dispatch = useDispatch();
  const [isModalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSubmitTicket = (ticketData: TicketData) => {
    dispatch(createTicket(ticketData) as any);
  };

  return (
    <View style={{ flex: 1 }}>
      {children}
      <SupportButton onPress={handleOpenModal} />
      <SupportModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTicket}
      />
    </View>
  );
};

export default SupportContainer;
