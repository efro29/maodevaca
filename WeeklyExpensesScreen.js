import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, FlatList, StyleSheet, Alert, TouchableOpacity, Modal, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

const getRandomColor = () => {
  // Gerar cores escuras (de 0 a 128 para garantir uma cor mais escura)
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    // Gerar números entre 0-8 (cores mais escuras)
    const value = Math.floor(Math.random() * 8);
    color += letters[value * 2]; // Garantir uma cor mais escura
  }
  return color;
};

const ProgressBar = ({ progress }) => {
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  );
};

const saveClients = async (clients) => {
  try {
    await AsyncStorage.setItem('clients', JSON.stringify(clients));
  } catch (error) {
    console.error('Erro ao salvar clientes:', error);
  }
};

const loadClients = async () => {
  try {
    const storedClients = await AsyncStorage.getItem('clients');
    return storedClients ? JSON.parse(storedClients) : [];
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
    return [];
  }
};

const WeeklyExpensesScreen = () => {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [clients, setClients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null); // Estado para cliente em edição
  const [mensalDinheiro, setInputValue] = useState('');
  const [pontos,setPontos] = useState(50)
  const [meta,setMeta] = useState(0)
  const [transactions, setTransactions] = useState([]);


  useEffect(() => {
    const fetchClients = async () => {
      const loadedClients = await loadClients();
      setClients(loadedClients);
    };
    fetchClients();
  }, []);


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



  useEffect(() => {
    const intervalId = setInterval(async () => {
      const loadedClients = await loadClients();
      loadInitialBalance();
    }, 1000); // Atualiza a cada 1000ms (1 segundo)

    // Limpeza do intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);

    loadInitialBalance();
  }, []);




  const handleInputChange = (text) => {
    // Atualiza o valor digitado
    setInputValue(text);

    // Calcula a meta e atualiza
    const valorNumerico = parseFloat(text); // Converte o texto para número
    if (!isNaN(valorNumerico)) {
      setMeta(Math.round(valorNumerico / 30)); // Calcula a meta
    } else {
      setMeta(0); // Define meta como 0 se o valor não for numérico
    }
  };

  

  const handleAddClient = async () => {
    if (!name.trim() || !birthdate.trim()) {
      alert('Por favor, preencha todos os campos.');
      return;
    }



    const newClient = {
      id: Date.now().toString(),
      name,
      birthdate,
      color: getRandomColor(),
      registrationDate: new Date().toLocaleDateString(), 
      mensalDinheiro,pontos,meta
    };
    

    const updatedClients = [...clients, newClient];
    await saveClients(updatedClients);
    setClients(updatedClients);
    setName('');
    setBirthdate('');
    setModalVisible(false);
    setInputValue('');
    
  };

  const handleEditClient = async () => {
    if (!name.trim() || !birthdate.trim()) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const updatedClients = clients.map((client) =>
      client.id === editingClient.id
        ? { ...client, name, birthdate,mensalDinheiro,pontos }
        : client
    );
    await saveClients(updatedClients);
    setClients(updatedClients);
    setName('');
    setBirthdate('');
    setEditingClient(null);
    setModalVisible(false);
    setInputValue('');
    
  };

  const handleDeleteClient = async (id) => {
    Alert.alert(
      'Confirmar exclusão',
      'Você tem certeza que deseja excluir este cliente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            const updatedClients = clients.filter((client) => client.id !== id);
            await saveClients(updatedClients);
            setClients(updatedClients);
          },
        },
      ]
    );
  };



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

  return { clientId, totalPontos, nome: myName };
});

// Definir nível baseado na pontuação total
const nivelTabela = [
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
  const nivel = nivelTabela.find(n => cliente.totalPontos >= n.minPontos) || nivelTabela[0];
  return { nome: cliente.nome, totalPontos: cliente.totalPontos, nivel: nivel.nivel };
});

// Exibir os resultados
niveisClientes.forEach(({ nome, totalPontos, nivel }) => {

});




// Salvar ou atualizar os dados no storage
const salvarDadosCliente = async (cliente, totalPontos, barra,indiceAtual) => {
  try {
    const dadosCliente = {
      elo:indiceAtual,
      nome: cliente.name,
      pontuacaoAtual: totalPontos,
      barraProgresso: barra
    };

    // Salvando os dados no AsyncStorage
    await AsyncStorage.setItem(`cliente_${cliente.id}`, JSON.stringify(dadosCliente));


  } catch (error) {
    console.error('Erro ao salvar dados do cliente:', error);
  }
};


const renderClientCard = ({ item }) => {
  // Encontre os dados do cliente a partir do array clients
  const client = clients.find(c => c.id === item.id);
 
 
  
  // Calcule a pontuação total e o nível do cliente
  const transacoesDoCliente = transactions.filter(tx => tx.clientId === item.name); // Filtra transações por cliente

  let totalPontos = 0;
  transacoesDoCliente.forEach(tx => {
    if (tx.type === "B") { // Considerando apenas as despesas
      const meta = client.meta; // Meta diária do cliente
      const somaDiaria = tx.value;
      let resultado = Math.round((meta - somaDiaria) / meta * 100);
      

      // console.log("---------------------------------------------")
      // console.log("Soma Diaria: "+somaDiaria)
      // console.log("Pontos Original: "+resultado)

      if(resultado < 0){

        if(resultado < -25){resultado = -45}else{resultado = resultado}

      }else{

        if(resultado > 60){Math.round(resultado = resultado)}else{Math.round(resultado = resultado/6)}

      }
   
    
      // console.log("Pontos Diarios: "+resultado)

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
  const cardColor2 = nivel.cor2;
  const cardColor3 = nivel.cor3;
  const cardColor4 = nivel.cor4;

   // Salvar os dados no AsyncStorage
    salvarDadosCliente(client, totalPontos, barra,indiceAtual);

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={[cardColor, cardColor2,cardColor3,cardColor4]}  // De um tom de prata mais claro para um tom mais escuro
        start={[0, 0]} 
        end={[1, 1]} 
          style={styles.card}
      >
      <View
        
      >
        {/* Botões Deletar e Editar */}
        <View style={styles.buttonsContainer}>
          {/* Botão Editar */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setEditingClient(item);
              setName(item.name);
              setBirthdate(item.birthdate);
              setModalVisible(true);
            }}
          >
            <MaterialIcons name="edit" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Botão Deletar */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteClient(item.id)}
          >
            <MaterialIcons name="delete" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

       
      




        {/* Nome do Banco e Ícone */}
        <View style={styles.bankContainer}>
          <MaterialIcons name="account-balance" size={16} color="rgba(255, 255, 255, 0.8)" />
          <Text style={styles.bankName}>{nivel.nivel}</Text>
        </View>

        {/* Nome do Cliente (Resumido) */}
        <Text style={styles.cardText}>
          {item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name}
        </Text>

        {/* Número de "Cartão de Crédito" */}
        <Text style={styles.cardId}>
          {item.id.slice(0, 4)} {item.id.slice(4, 8)} {item.id.slice(8, 12)} {item.id.slice(12)}
        </Text>

        {/* Data de Solicitação do Cartão e Data de Aniversário lado a lado */}
        <View style={styles.dateContainer}>
          <Text style={styles.registrationDate}>Solicitado em: {item.registrationDate}</Text>
          <Text style={styles.birthDate}>Aniversário: {item.birthdate}</Text>
        </View>

        {/* Pontuação e Nível */}
        <View style={styles.dateContainer}>
          <ProgressBar  progress={barra} />
          <Text style={styles.scoreText}>{Math.round(totalPontos)}</Text>
        </View>


      </View>
      </LinearGradient>
    </View>
  );
};


  return (
    <SafeAreaView style={styles.container}>


      {/* Botão para abrir o modal */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="add" size={24} color="purple" />
        <Text style={styles.addButtonText}>Adicionar Cliente</Text>
      </TouchableOpacity>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={renderClientCard}
        contentContainerStyle={styles.list}
      />

      {/* Modal para inserir ou editar cliente */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingClient ? 'Editar Cliente' : 'Adicionar Cliente'}
            </Text>

            {/* Campo Nome */}
            <TextInput
              placeholder="Digite o nome do cliente"
              value={name}
              onChangeText={setName}
              style={styles.modalInput}
            />

          <TextInput
            placeholder="Renda Mensal"
            value={mensalDinheiro}
            keyboardType="numeric"
            onChangeText={handleInputChange} // Chama a função para lidar com a mudança
            style={styles.modalInput}
            />

          <TextInput
              readOnly
            placeholder="Renda Mensal"
            value={'Meta Diária : R$'+meta.toFixed(2)}
            keyboardType="numeric"
            style={styles.modalInput}
            />

       

            {/* Campo Data de Aniversário com máscara */}
            <TextInput
              placeholder="Digite a data de aniversário (DD/MM/AAAA)"
              value={birthdate}
              onChangeText={(text) => setBirthdate(formatDate(text))}
              style={styles.modalInput}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#888" />
              <Button
                title={editingClient ? 'Salvar Alterações' : 'Adicionar'}
                onPress={editingClient ? handleEditClient : handleAddClient}
                color="#33b5e5"
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'purple',
    fontSize: 16,
    marginLeft: 10,
  },
  list: {
    flexGrow: 1,
  },
  cardContainer: {
    marginVertical: 10,
  },
  card: {
    padding: 20,
    borderRadius: 15,
    position: 'relative',
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
  registrationDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  birthDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,gap:2,
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#444',
    borderRadius: 5,
    padding: 8,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#444',
    borderRadius: 5,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBarContainer: {
    width: '70%', // Largura reduzida
    height: 15, // Altura menor
    backgroundColor: '#e0e0e0', // Cor de fundo da barra
    borderRadius: 5, // Borda arredondada
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007bff', // Cor azul para a barra de progresso
  },
  progressText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  c: {
    width: 300,
    height: 200,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5, // para o Android
    position: 'relative',
  },
});

export default WeeklyExpensesScreen;
