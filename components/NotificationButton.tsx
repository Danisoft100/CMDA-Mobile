import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useDispatch, useSelector } from 'react-redux';
import { getUnreadCount } from '../store/actions/supportActions';
import NotificationCenter from './NotificationCenter';

const NotificationButton = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch<any>();
  const { notifications } = useSelector((state: any) => state.support);
  const { unreadCount } = notifications;
  
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Load unread count on mount
    dispatch(getUnreadCount());

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(getUnreadCount());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.card }]}
        onPress={handleOpenModal}
      >
        <AntDesign name="bells" size={20} color={colors.text} />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.error }]}>
            <Text style={[styles.badgeText, { color: colors.white }]}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      
      <NotificationCenter
        visible={isModalVisible}
        onClose={handleCloseModal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    padding: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationButton;
