import React, { useEffect, useState } from 'react';
import { View,TextInput, Text, StyleSheet, TouchableOpacity, Image, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Importamos el hook para la navegación
//import { initializeDatabase, actualizarNombre } from '@/database/db';

// import * as SQLite from 'expo-sqlite'; 


export default function index() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');

  //DATABASE
  // const db = await SQLite.openDatabaseAsync('DBrain.db');

  // db.execAsync


  // useEffect(() => {
  //   initializeDatabase(); // Call to initialize the database
  // }, []);



  // const handleSaveUsername = () => {
  //   if (username.trim() === '') {
  //     Alert.alert('Error', 'Por favor, ingresa un nombre de usuario.');
  //     return;
  //   }
  //   actualizarNombre(username);
  //   Alert.alert('Éxito', `Nombre de usuario "${username}" guardado.`);
  //   setUsername(''); // Clear the input field
  // };

  return (
    <View style={styles.container}>
      {/* Header con saludo */}
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola, Usuario!</Text>
        <Text style={styles.subHeader}>Bienvenido a tu panel de control</Text>
      </View>
      {/* Sección de progreso del usuario */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Progreso del usuario</Text>
        {/* <Image 
          source={require('@/assets/images/progress-bar.png')} 
          style={styles.progressBar}
        /> */}
        <Text style={styles.progressText}>Nivel 3 de 10 completado</Text>
      </View>


      <View style={styles.buttonsContainer}>
        <Text style={styles.title}>Ingresar Us</Text>
        <SafeAreaView>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu nombre"
            onChangeText={setUsername}
            value={username}
          />
        </SafeAreaView>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Administrador')}
          // handleSaveUsername
        >
          <Text style={styles.buttonText}>Ir con la patrona</Text>
        </TouchableOpacity>

      </View>






      {/* Botones para navegar a las principales secciones */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Desafios')}
        >
          <Text style={styles.buttonText}>Niveles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Desafios')}
        >
          <Text style={styles.buttonText}>Trofeos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Desafios')}
        >
          <Text style={styles.buttonText}>Asesorías</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27613C',
  },
  subHeader: {
    fontSize: 18,
    color: '#707070',
  },
  progressSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBar: {
    width: '80%',
    height: 20,
    backgroundColor: '#27613C',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    color: '#707070',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
});
