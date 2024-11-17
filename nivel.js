import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView,Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const nivelTabela = [
  { nivel: "Ferro", minPontos: 0, cor: "#B4B4B4", cor2: '#6E6E6E', cor3: '#4B4B4B', cor4: '#3A3A3A', image: require('./assets/elo6.png') },
  { nivel: "Bronze", minPontos: 1000, cor: "#CD7F32", cor2: '#B87333', cor3: '#7C4F30', cor4: '#4A2C21', image: require('./assets/elo5.png') },
  { nivel: "Prata", minPontos: 2000, cor: "#C0C0C0", cor2: '#A9A9A9', cor3: '#808080', cor4: '#696969', image: require('./assets/elo4.png') },
  { nivel: "Ouro", minPontos: 3000, cor: "#FFD700", cor2: '#FFC300', cor3: '#D4AF37', cor4: '#B8860B', image: require('./assets/elo3.png') },
  { nivel: "Platina", minPontos: 4000, cor: "#E5E4E2", cor2: '#D1D0CE', cor3: '#B8B8B1', cor4: '#A8A8A2', image: require('./assets/elo2.png') },
  { nivel: "Diamante", minPontos: 5000, cor: "#B9F2FF", cor2: '#A9D1E2', cor3: '#8BB8C1', cor4: '#7A9CA4', image: require('./assets/elo1.png') },
  { nivel: "Radiante", minPontos: 6000, cor: "#9966CC", cor2: '#8A4B9D', cor3: '#7A2C80', cor4: '#5E1F5B', image: require('./assets/elo0.png') }
];

const LevelCard = ({ nivel, cor, cor2, cor3, cor4, pontos, image }) => (
  <View style={styles.cardContainer}>
    <LinearGradient
      colors={[cor, cor2, cor3, cor4]}  // De um tom mais claro para um tom mais escuro
      start={[0, 0]} 
      end={[1, 1]} 
      style={styles.card}
    >
      <View>
        {/* Nome do Banco e Ícone */}
        <View style={styles.bankContainer}>
          <MaterialIcons name="account-balance" size={16} color="rgba(255, 255, 255, 0.8)" />
          <Text style={styles.bankName}>{nivel}</Text>
        </View>

        {/* Nome do Cliente (Resumido) */}
        <Text style={styles.cardText}>
          23456 78
        </Text>

        {/* Número de "Cartão de Crédito" */}
        <Text style={styles.cardId}>
          Pontos: {pontos}
        </Text>

        {/* Pontuação e Nível */}
        <View style={styles.dateContainer}>
          {/* Colocando a imagem no canto inferior direito */}
          <Image source={image} style={styles.image} />
        </View>
      </View>
    </LinearGradient>
  </View>
);

const NivelPage = () => (
  <SafeAreaView style={styles.container}>

    <View style={{height:650,padding:15}}>

    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {nivelTabela.map((item, index) => (
        <LevelCard 
          key={index} 
          nivel={item.nivel} 
          cor={item.cor} 
          cor2={item.cor2} 
          cor3={item.cor3} 
          cor4={item.cor4} 
          pontos={item.minPontos}
          image={item.image}
        />
      ))}
    </ScrollView>


    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 10,
  },
  card: {
    padding: 20,
    borderRadius: 15,
    position: 'relative', // A posição relativa vai ser útil para posicionar a imagem no canto inferior direito
    elevation: 5,
  },
  bankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 5,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 50,
  },
  cardId: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  image: {
    position: 'absolute',
    bottom: 10, // Distância do fundo do card
    right: 10,  // Distância da borda direita do card
    width: 50,  // Largura da imagem
    height: 50, // Altura da imagem
    borderRadius: 25,  // Arredondar a imagem (se for uma imagem circular)
  
  },
});


export default NivelPage;
