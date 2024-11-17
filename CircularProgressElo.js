    import React from 'react';
    import { View, Text, StyleSheet ,Image } from 'react-native';
    import { Svg, Circle } from 'react-native-svg';
    import Icon from 'react-native-vector-icons/FontAwesome'; // Importando o FontAwesome para ícones

    const CircularProgressElo = ({ percent = 0, size = 120, strokeWidth = 10, color = '#4CAF50', backgroundColor = '#e6e6e6' ,ico}) => {
      const radius = (size - strokeWidth) / 2; // Calcula o raio
      const circumference = 2 * Math.PI * radius; // Comprimento total do círculo
      const strokeDashoffset = circumference - (percent / 100) * circumference; 
      
      const images = {
        0: require('./assets/elo0.png'),
        1: require('./assets/elo1.png'),
        2: require('./assets/elo2.png'),
        3: require('./assets/elo3.png'),
        4: require('./assets/elo4.png'),
        5: require('./assets/elo5.png'),
        6: require('./assets/elo6.png'),
      };

      const elos = {

                      6: "Ferro", 
                      5: "Bronze", 
                      4: "Prata",   
                      3: "Ouro",  
                      2: "Platina`", 
                      1: "Diamante", 
                      0: "Mão de Vaca", 
        
      }
      
      const imageSource = images[ico] || require('./assets/elo1.png'); 
      const eloName = elos[ico] || "Mão de Vaca: Mestre da Poupança"; 
      // Calcula o progresso com base no percentual

      return (

        <View style={ styles.center}>
        
        
        <View style={styles.container}>
          <Svg width={size} height={size}>
            {/* Fundo do círculo */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={backgroundColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Círculo de progresso */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`} // Inicia o progresso no topo
            />
          </Svg>
          {/* Texto central */}
          <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Image 
              source={imageSource} // Caminho relativo da imagem
              style={styles.image}
            />

          </View>
 
        </View>
        <Text>{eloName}</Text>
        </View>
        
      );
    };

    const styles = StyleSheet.create({
      container: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      center: {
        justifyContent: 'center',
        alignItems: 'center'
      },
      text: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#493d54',
      },
      image: {
        width: 80, // Tamanho da imagem
        height: 80,
     
      },
    });

    export default CircularProgressElo;
