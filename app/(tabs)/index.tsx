import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, SafeAreaView, StatusBar, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';

type ButtonType = 'number' | 'operation' | 'equals' | 'clear';

interface CalculatorButtonProps {
  text: string;
  onPress: () => void;
  type: ButtonType;
  disabled?: boolean;
  span?: boolean;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ 
  text, 
  onPress, 
  type, 
  disabled = false,
  span = false
}: CalculatorButtonProps) => {
  const colorScheme = useColorScheme();
  
  const getBackgroundColor = () => {
    if (disabled) return colorScheme === 'dark' ? '#333' : '#ddd';
    
    switch (type) {
      case 'number':
        return colorScheme === 'dark' ? '#333' : '#f0f0f0';
      case 'operation':
        return '#ff9500';
      case 'equals':
        return '#2196F3';
      case 'clear':
        return '#ff3b30';
      default:
        return colorScheme === 'dark' ? '#333' : '#f0f0f0';
    }
  };

  const getTextColor = () => {
    if (disabled) return colorScheme === 'dark' ? '#666' : '#999';
    
    switch (type) {
      case 'number':
        return colorScheme === 'dark' ? '#fff' : '#000';
      case 'operation':
      case 'equals':
      case 'clear':
        return '#fff';
      default:
        return colorScheme === 'dark' ? '#fff' : '#000';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        span && styles.spanButton,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <ThemedText 
        style={[styles.buttonText, { color: getTextColor() }]}
      >
        {text}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null | 'Error'>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const colorScheme = useColorScheme();

  const clearDisplay = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperation(null);
    setWaitingForSecondOperand(false);
  };

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operation && firstOperand !== 'Error') {
      const result = calculate(firstOperand, inputValue, operation);
      setDisplay(String(result));
      setFirstOperand(result);
    } else if (firstOperand === 'Error') {
      // If there was an error, just clear it when a new operation is performed
      setFirstOperand(inputValue);
      setDisplay(String(inputValue));
    }

    setWaitingForSecondOperand(true);
    setOperation(nextOperator);
  };

  const calculate = (firstOperand: number, secondOperand: number, operation: string): number | 'Error' => {
    switch (operation) {
      case '+':
        return firstOperand + secondOperand;
      case '-':
        return firstOperand - secondOperand;
      case '×':
        return firstOperand * secondOperand;
      case '÷':
        return secondOperand !== 0 ? firstOperand / secondOperand : 'Error';
      default:
        return secondOperand;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ThemedView style={styles.calculator}>
        <View style={styles.displayContainer}>
          <Text style={[styles.display, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>{display}</Text>
        </View>

        <View style={styles.buttonRow}>
          <CalculatorButton text="C" onPress={clearDisplay} type="clear" />
          <CalculatorButton text="±" onPress={() => setDisplay(String(parseFloat(display) * -1))} type="operation" />
          <CalculatorButton text="%" onPress={() => setDisplay(String(parseFloat(display) / 100))} type="operation" />
          <CalculatorButton text="÷" onPress={() => performOperation('÷')} type="operation" />
        </View>

        <View style={styles.buttonRow}>
          <CalculatorButton text="7" onPress={() => inputDigit('7')} type="number" />
          <CalculatorButton text="8" onPress={() => inputDigit('8')} type="number" />
          <CalculatorButton text="9" onPress={() => inputDigit('9')} type="number" />
          <CalculatorButton text="×" onPress={() => performOperation('×')} type="operation" />
        </View>

        <View style={styles.buttonRow}>
          <CalculatorButton text="4" onPress={() => inputDigit('4')} type="number" />
          <CalculatorButton text="5" onPress={() => inputDigit('5')} type="number" />
          <CalculatorButton text="6" onPress={() => inputDigit('6')} type="number" />
          <CalculatorButton text="-" onPress={() => performOperation('-')} type="operation" />
        </View>

        <View style={styles.buttonRow}>
          <CalculatorButton text="1" onPress={() => inputDigit('1')} type="number" />
          <CalculatorButton text="2" onPress={() => inputDigit('2')} type="number" />
          <CalculatorButton text="3" onPress={() => inputDigit('3')} type="number" />
          <CalculatorButton text="+" onPress={() => performOperation('+')} type="operation" />
        </View>

        <View style={styles.buttonRow}>
          <CalculatorButton text="0" onPress={() => inputDigit('0')} type="number" span />
          <CalculatorButton text="." onPress={inputDecimal} type="number" />
          <CalculatorButton text="=" onPress={() => performOperation('=')} type="equals" />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calculator: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  displayContainer: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    minHeight: 120,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  display: {
    fontSize: 70,
    textAlign: 'right',
    fontWeight: '300',
    letterSpacing: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  button: {
    flex: 1,
    borderRadius: 24,
    height: 72,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spanButton: {
    flex: 2,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '500',
  },
});
