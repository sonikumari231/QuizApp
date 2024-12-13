// src/components/Title.js
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

const Title = ({ titleText }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{titleText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
});

export default Title;
