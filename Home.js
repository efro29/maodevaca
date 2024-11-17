import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Modal, TextInput, Button, Alert, SafeAreaView ,Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importando o FontAwesome para ícones
import { Divider } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import CircularProgress from './CircularProgress';
import CircularProgressElo from './CircularProgressElo';
import WeeklySpendingChart from './WeeklySpendingChart';


function HomeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedButton, setSelectedButton] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [comment, setComment] = useState('');
  const [initialBalance, setInitialBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [clients, setClients] = useState([]);


  const getFormattedDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0'); // Garante dois dígitos
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Meses começam do zero
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  };


  const [data, setData] = useState(getFormattedDate());
  const [today,setToday] = useState('')

  const [selectedClient, setSelectedClient] = useState( null);


  const clientItems = clients.map(client => ({
    label: client.name, // Exibe o nome do cliente
    value: client.name, // Usamos o ID como o valor único para o cliente
  }));


  
  // Função para adicionar barras na data enquanto o usuário digita
const formatDate = (text) => {
  let cleanedText = text.replace(/\D/g, '');
  
  if (cleanedText.length <= 2) {
    cleanedText = cleanedText.replace(/(\d{2})(\d{0,2})/, '$1/$2');
  } else if (cleanedText.length <= 4) {
    cleanedText = cleanedText.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
  } else {
    cleanedText = cleanedText.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
  }

  return cleanedText;
};

  const now = new Date();
  const currentMonth = now.getMonth(); // Mês atual (0 = Janeiro, 11 = Dezembro)
  const currentYear = now.getFullYear(); // Ano

  const sumTypeA = transactions
  .filter(item => {
    const itemDate = new Date(item.date);
    return (
      item.type === "A" &&
      itemDate.getMonth() === currentMonth && // Verifica se o mês é o atual
      itemDate.getFullYear() === currentYear // Verifica se o ano é o atual
    );
  })
  .reduce((sum, item) => sum + item.value, 0);

  const sumTypeB = transactions
  .filter(item => {
    const itemDate = new Date(item.date);
    return (
      item.type === "B" &&
      itemDate.getMonth() === currentMonth && // Verifica se o mês é o atual
      itemDate.getFullYear() === currentYear // Verifica se o ano é o atual
    );
  })
  .reduce((sum, item) => sum + item.value, 0);





  const sumTotalA = transactions
  .filter(item => {
    const itemDate = new Date(item.date);
    return (
      item.type === "A" 
    );
  })
  .reduce((sum, item) => sum + item.value, 0);

  const sumTotalB = transactions
  .filter(item => {
    const itemDate = new Date(item.date);
    return (
      item.type === "B" 
    );
  })
  .reduce((sum, item) => sum + item.value, 0);
  
  const balance = sumTotalA - sumTotalB ;



  const loadClients = async () => {
    try {
      const storedClients = await AsyncStorage.getItem('clients');
      return storedClients ? JSON.parse(storedClients) : [];
    } catch (error) {
      // console.error('Erro ao carregar clientes:', error);
      return [];
    }
  };

  const loadInitialBalance = async () => {
    try {
      const storedBalance = await AsyncStorage.getItem('initialUBalance');
      const storedTransactions = await AsyncStorage.getItem('transactions');
      if (storedBalance !== null) {
        setInitialBalance(parseFloat(storedBalance));
      }
      if (storedTransactions !== null) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  };



  const [idClient,setIdClient] = useState(0)
  const [nameClient,setNameClient] = useState('Amélia')


  useEffect(() => {
    const intervalId = setInterval(async () => {
      const loadedClients = await loadClients();

        if(loadedClients.length > 0){


          setClients(loadedClients);
          setIdClient(loadedClients[0].id)
          setNameClient(loadedClients[0].name)

        }

    

  
    }, 1000); // Atualiza a cada 1000ms (1 segundo)

    // Limpeza do intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, []);





  

  const [dataSelecionada,setdataselecionada] = useState('')
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const loadedClients = await loadClients();
      loadInitialBalance();

 



    }, 1000); // Atualiza a cada 1000ms (1 segundo)

    // Limpeza do intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, [data]);



  const openModal = (button) => {
    setSelectedButton(button);
    setModalVisible(true);
    setInputValue('');
    setComment('');
  };

  const closeModal = () => {
    setModalVisible(false);
    setData(getFormattedDate())
  };

  const insertValue = async () => {

    if (!inputValue || isNaN(inputValue)) {
      Alert.alert("Erro", "Por favor, insira um valor numérico.");
      return;
    }

    const newValue = parseFloat(inputValue);
    let updatedBalance;

      const [day, month, year] = data.split("/"); // Divide a string em partes
      const now = new Date(year, month - 1, day).toISOString();

 

    let transaction = { 
      value: newValue, 
      comment, 
      category: comment || "Outros", 
      type: selectedButton,
      date:  now   ,clientId: selectedClient
    };

    if (selectedButton === 'A') {
      updatedBalance = initialBalance + newValue;
      Alert.alert("Valor Inserido", `R$ ${newValue.toFixed(2)} foi adicionado ao saldo inicial. Comentário: ${comment}`);
    } else if (selectedButton === 'B') {
      if (newValue > balance) {
        Alert.alert("Erro", "Não é possível subtrair um valor maior que o saldo atual.");
        return;
      }
      updatedBalance = initialBalance - newValue;
      Alert.alert("Valor Subtraído", `R$ ${newValue.toFixed(2)} foi subtraído do saldo inicial. Comentário: ${comment}`);
    } else if (selectedButton === 'C') {
      updatedBalance = newValue;
      Alert.alert("Novo Saldo Definido");
    }

    setInitialBalance(updatedBalance);
    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);

    try {
      await AsyncStorage.setItem('initialBalance', updatedBalance.toString());
      await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error("Erro ao salvar dados", error);
    }

    closeModal();
  };

  const calculateCategoryPercentages = () => {
    const totalSpent = transactions.reduce((acc, transaction) => {
      return transaction.type === 'B' ? acc + transaction.value : acc;
    }, 0);

    const categoryTotals = {
      Lar: 0,
      Transporte: 0,
      Alimentação: 0,
      Lazer: 0,
      Saude: 0,Estudos: 0,
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'B' && categoryTotals[transaction.category] !== undefined) {
        categoryTotals[transaction.category] += transaction.value;
      }
    });

    const categoryPercentages = {};
    Object.keys(categoryTotals).forEach(category => {
      categoryPercentages[category] = totalSpent > 0 ? (categoryTotals[category] / totalSpent * 100).toFixed(2) : 0;
    });

    return categoryPercentages;
  };

  const categoryPercentages = calculateCategoryPercentages();

  // Definindo cores e ícones para cada categoria
  const categoryStyles = {
    Lar: { color: '#f4edfa', icon: 'home' },
    Transporte: { color: '#f4edfa', icon: 'car' },
    Alimentação: { color: '#f4edfa', icon: 'coffee' }, // Usando 'food' para Alimentação
    Lazer: { color: '#f4edfa', icon: 'gamepad' }, // Usando 'cocktail' para Lazer,
    Saude: { color: '#f4edfa', icon: 'heart' }, // Usando 'cocktail' para Lazer
    Estudos: { color: '#f4edfa', icon: 'pencil' }, // Usando 'cocktail' para Lazer
  };


//   let indiceAtual = 6
//   let barra = 10

// if(clients.length > 0){


  // Agrupar transações por cliente e data
  const transacoesAgrupadas = transactions.reduce((acc, tx) => {
    if (tx.type === "B") { // Somente as despesas
      const date = tx.date.split("T")[0]; // Extrai a data no formato YYYY-MM-DD
      if (!acc[tx.clientId]) {
        acc[tx.clientId] = {}; // Cria um objeto para o cliente, se não existir
      }
      if (!acc[tx.clientId][date]) {
        acc[tx.clientId][date] = 0; // Cria um contador de soma diária para aquele dia
      }
      acc[tx.clientId][date] += tx.value; // Soma as despesas por data
    }
    return acc;
  }, {});
  
  // Cálculo da pontuação diária e total por cliente
  const pontosTotais = Object.entries(transacoesAgrupadas).map(([clientId, transacoes]) => {
    const cliente = clients.find(c => c.name === clientId);
  
    let totalPontos = 0;


    if(cliente){
       myMeta = cliente.meta
       myName = cliente.name
    }else{
     myMeta = 100
      myName = 'AMELINHA'
    }
  
    // Calcular a pontuação diária para cada data
    Object.entries(transacoes).forEach(([date, somaDiaria]) => {
      const resultado = Math.round((myMeta - somaDiaria) / myMeta * 100);
      totalPontos += resultado; // Soma a pontuação do dia
    });
   
    return { clientId, totalPontos, nome:myName };
  });
  
  // Definir nível baseado na pontuação total
  const nivelTabela1 = [
    { nivel: "Ferro", minPontos: 0, cor: "#B4B4B4", cor2: '#6E6E6E', cor3: '#4B4B4B', cor4: '#3A3A3A', image: require('./assets/elo6.png') },
    { nivel: "Bronze", minPontos: 1000, cor: "#CD7F32", cor2: '#B87333', cor3: '#7C4F30', cor4: '#4A2C21', image: require('./assets/elo5.png') },
    { nivel: "Prata", minPontos: 2000, cor: "#C0C0C0", cor2: '#A9A9A9', cor3: '#808080', cor4: '#696969', image: require('./assets/elo4.png') },
    { nivel: "Ouro", minPontos: 3000, cor: "#FFD700", cor2: '#FFC300', cor3: '#D4AF37', cor4: '#B8860B', image: require('./assets/elo3.png') },
    { nivel: "Platina", minPontos: 4000, cor: "#E5E4E2", cor2: '#D1D0CE', cor3: '#B8B8B1', cor4: '#A8A8A2', image: require('./assets/elo2.png') },
    { nivel: "Diamante", minPontos: 5000, cor: "#B9F2FF", cor2: '#A9D1E2', cor3: '#8BB8C1', cor4: '#7A9CA4', image: require('./assets/elo1.png') },
    { nivel: "Radiante", minPontos: 6000, cor: "#9966CC", cor2: '#8A4B9D', cor3: '#7A2C80', cor4: '#5E1F5B', image: require('./assets/elo0.png') }
  ];
  
  
  // Determinar o nível do cliente baseado na pontuação total
  const niveisClientes = pontosTotais.map(cliente => {
    // Encontrar o nível correspondente ou atribuir o primeiro nível se não houver correspondência
    const nivel = nivelTabela1.find(n => cliente.totalPontos >= n.minPontos) || nivelTabela1[0];
    return { nome: cliente.nome, totalPontos: cliente.totalPontos, nivel: nivel.nivel };
  });
  
  // Exibir os resultados
  niveisClientes.forEach(({ nome, totalPontos, nivel }) => {
  
  });
  
  
   const client = clients.find(c => c.id === idClient);
  
   const transacoesDoCliente = transactions.filter(tx => tx.clientId === nameClient); // Filtra transações por cliente
   

   let totalPontos = 0;
   transacoesDoCliente.forEach(tx => {
     if (tx.type === "B") { 

   
      const meta = client.meta; // Meta

       const somaDiaria = tx.value;
       let resultado = Math.round((meta - somaDiaria) / meta * 100);
       
       if(resultado < 0){
  
         if(resultado < -25){resultado = -45}else{resultado = resultado}
  
       }else{
  
         if(resultado > 60){Math.round(resultado = resultado)}else{Math.round(resultado = resultado/6)}
  
       }
    

       totalPontos += resultado;
       // console.log('Pontos: ' + totalPontos)
       if (totalPontos < 0) {
         totalPontos = 0;
       }
   
     }
   });
  
   // Definir o nível do cliente com base nos pontos totais
   const nivelTabela = [
    { nivel: "Ferro", minPontos: 0, cor: "#B4B4B4", cor2: '#6E6E6E', cor3: '#4B4B4B', cor4: '#3A3A3A', image: require('./assets/elo6.png') },
    { nivel: "Bronze", minPontos: 1000, cor: "#CD7F32", cor2: '#B87333', cor3: '#7C4F30', cor4: '#4A2C21', image: require('./assets/elo5.png') },
    { nivel: "Prata", minPontos: 2000, cor: "#C0C0C0", cor2: '#A9A9A9', cor3: '#808080', cor4: '#696969', image: require('./assets/elo4.png') },
    { nivel: "Ouro", minPontos: 3000, cor: "#FFD700", cor2: '#FFC300', cor3: '#D4AF37', cor4: '#B8860B', image: require('./assets/elo3.png') },
    { nivel: "Platina", minPontos: 4000, cor: "#E5E4E2", cor2: '#D1D0CE', cor3: '#B8B8B1', cor4: '#A8A8A2', image: require('./assets/elo2.png') },
    { nivel: "Diamante", minPontos: 5000, cor: "#B9F2FF", cor2: '#A9D1E2', cor3: '#8BB8C1', cor4: '#7A9CA4', image: require('./assets/elo1.png') },
    { nivel: "Radiante", minPontos: 6000, cor: "#9966CC", cor2: '#8A4B9D', cor3: '#7A2C80', cor4: '#5E1F5B', image: require('./assets/elo0.png') }
   ];
   
   const nivel = nivelTabela.reverse().find(n => totalPontos >= n.minPontos) || nivelTabela[0];

   const indiceAtual = nivelTabela.findIndex(n => n.nivel === nivel.nivel);
   const proximoNivel = indiceAtual < nivelTabela.length - 0 ? nivelTabela[indiceAtual -1] : null;


   let pontosFaltando = 0;
   if (proximoNivel) {
     pontosFaltando = proximoNivel.minPontos - totalPontos;
     pontosTarget = proximoNivel.minPontos ;
     barra = Math.round(totalPontos/pontosTarget*100)
  
   }
   let intervalStart = Math.floor(totalPontos / 1000) * 1000; 
   let barra = ((totalPontos - intervalStart) / 1000) * 100;
   

   const cardColor = nivel.cor;
  
   // Função para processar os dados
const processData = (transactions) => {
  // Array com os dias da semana
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Inicializar soma por dia da semana com 0
  const weeklySums = Array(7).fill(0);

  // Somar valores do tipo B por dia
  transactions.forEach((transaction) => {
    if (transaction.type === 'B') {
      const date = new Date(transaction.date);
      const dayIndex = date.getDay(); // Índice do dia da semana (0-6)
      weeklySums[dayIndex] += transaction.value;
    }
  });

  return { labels: weekDays, data: weeklySums };
};



  return (
    <SafeAreaView style={styles.appContainer}>
      
      <View style={styles.container}>
      <View style={styles.card}>

 

            <View style={styles.cardContent}>
            <CircularProgressElo ico={indiceAtual} percent={barra} size={100} strokeWidth={5} color={cardColor} />

              {/* <Image
                source={require('./assets/carteira.png')} // Certifique-se de adicionar a imagem em assets
                style={styles.walletIcon}
                /> */}
           
                <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{nameClient}</Text>

                  <Text style={styles.cardValue}>
                  R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>

                  <View style={styles.cardContent}>
                    <Text style={styles.cardValueSumA}>
                    Total Receita R$ {sumTypeA.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>

                  <View style={styles.cardContent}>
                    <Text style={styles.cardValueSumB}>
                    Total Despesas R$ {sumTypeB.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>



            <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonA} onPress={() => openModal('A')}>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
             <Icon style={{ marginRight: 5 }} name={'plus'} size={15} color="#fff" />
             <Text style={styles.buttonText}>Receita</Text>
           </View>

          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonB} onPress={() => openModal('B')}>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
             <Icon style={{ marginRight: 5 }} name={'minus'} size={15} color="#fff" />
             <Text style={styles.buttonText}>Despesa</Text>
            </View>

          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonC} onPress={() => openModal('C')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon style={{ marginRight: 5 }} name={'refresh'} size={15} color="#fff" />
                <Text style={styles.buttonText}>Redefinir</Text>
              </View>
          </TouchableOpacity>
        </View>
            

        <View style={styles.gridContainer}>
          {['Lar', 'Transporte', 'Alimentação', 'Lazer','Saude','Estudos'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.gridButton, { backgroundColor: categoryStyles[category].color }]}
              onPress={() => openModal('B') & setComment(category)}
            >
    
              {/* <Text style={styles.gridButtonText}>{categoryPercentages[category]}%</Text> */}
         
              <CircularProgress ico={categoryStyles[category].icon} percent={categoryPercentages[category]} size={80} strokeWidth={7} color="#3b5998" />
             
                   <Text style={styles.gridButtonText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>




        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Insira um valor</Text>
              <TextInput
                style={styles.input}
                placeholder="R$ 0,00"
                keyboardType="numeric"
                value={inputValue}
                onChangeText={setInputValue}
              />
              <TextInput
                style={styles.input}
                placeholder="Comentário (opcional)"
                value={comment}
                onChangeText={setComment}
              />



          <TextInput
              placeholder="Data"
              value={data}
              onChangeText={(text) => setData(formatDate(text))}
              style={styles.modalInput}
              keyboardType="numeric"
            />


<RNPickerSelect
 style={{backgroundColor:'red'}}

        onValueChange={(value) => { setSelectedClient(value) }}
   
        items={clientItems} // Passando os clientes mapeados
      />


              <View style={styles.modalButtonContainer}>
                <Button  title="Inserir" onPress={insertValue} />
                <Button title="Fechar" onPress={closeModal} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>

    
    
  );

  
}



export default HomeScreen;