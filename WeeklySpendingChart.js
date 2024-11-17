import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const WeeklySpendingChart = ({ transactions }) => {
  // Função para processar os dados
  const processData = (transactions) => {
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weeklySums = Array(7).fill(0);

    transactions.forEach((transaction) => {
      if (transaction.type === 'B') {
        const date = new Date(transaction.date);
        const dayIndex = date.getDay();
        weeklySums[dayIndex] += transaction.value;
      }
    });

    return { labels: weekDays, data: weeklySums };
  };

  const { labels, data } = processData(transactions);

  return (
    <View style={{ width:50}}>


      <BarChart
        data={{
          labels: labels, // Dias da semana
          datasets: [{ data: data }], // Valores
        }}
        width={381} // Largura do gráfico
        height={220} // Altura do gráfico
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#4c8bf5',
          backgroundGradientTo: '#4c8bf5',
          decimalPlaces: 0, // Sem casas decimais
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Branco para os dados
          
          propsForBackgroundLines: {
            strokeDasharray: '', // Remove as linhas tracejadas
            strokeWidth: 0, // Remove completamente as linhas
          },
        }}
        fromZero // Garante que o gráfico comece do zero
        showBarTops={true} // Mostra os valores no topo das barras
        withVerticalLabels={true} // Mantém labels horizontais
        withInnerLines={false} // Remove as linhas internas
        style={{
          borderRadius: 8,
          shadowColor: '#000',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: 5, // Para Android: adiciona sombra
        }}
        verticalLabelRotation={0} // Mantém as labels horizontais
        renderBarTops={({ x, y, index, value }) => (
          <Text
            key={index}
            style={{
              position: 'absolute',
              left: x - 1,
              top: y - 1,
              fontSize: 1,
              fontWeight: 'bold',
              color: '#333',
            }}
          >
           0
          </Text>
        )}
      />
    </View>
  );
};

export default WeeklySpendingChart;
