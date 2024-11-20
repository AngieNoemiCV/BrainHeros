import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/database/supabase'; // Importar el cliente de Supabase
import { useNavigation } from '@react-navigation/native'; // Importar el hook de navegación
import { useFocusEffect } from 'expo-router';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Para el registro
  const [isRegistering, setIsRegistering] = useState(false); // Estado para cambiar entre login y registro

  useFocusEffect(
    useCallback(() => {
      checkSession(); // Verificar si hay una sesión abierta
      setPassword(''),
      setName(''),
      setEmail('')
    }, []),
  );

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession(); // Método correcto para obtener la sesión
      if (session) {
        navigation.navigate('Panel'); // Navegar a la pantalla de inicio de sesión
      } else {
        //console.log("Usuario logueado");
        //console.log("Usuario logueado", session);
      }
    } catch {
      navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
      return
    }
  };

  // Función para manejar el registro de un nuevo usuario
  const handleRegister = async () => {
    const { user, error } = await supabase.auth.signUp(
      { email, password },
    );

    const is_admin = false

    if (error) {
      Alert.alert('Error en el registro', error.message);
    } else {
      console.log("vamos a registrar Usuario")
      // Insertar en la tabla Usuario
      const { data, error: insertError } = await supabase
        .from('usuario')
        .insert([{ email, name, is_admin}]);

        if (insertError) {
          Alert.alert('Error al insertar usuario', insertError.message);
        } else {
          //Alert.alert('Registro exitoso');
          fillProgressTable(email); // Llamamos a la función para llenar ProgressTable
        }
      console.log("Registro exitoso")
      Alert.alert('Registro exitoso');
      handleLogin();
    }
  };

  // Función para manejar el inicio de sesión
  const handleLogin = async () => {
    const { user, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      Alert.alert('Error en el inicio de sesión', error.message);
    } else {
      Alert.alert('Inicio de sesión exitoso');
      navigation.navigate('Panel'); // Redirigir a la pantalla de niveles después del login
    }
  };

  // Funcion para llenar la ProgressTable
  const fillProgressTable = async (email) => {
    try {
      // Paso 1: Obtener todos los niveles de QuestionsTable
      const { data: questions, error: questionsError } = await supabase
        .from('QuestionsTable')
        .select('level');
  
      if (questionsError) {
        console.error('Error al obtener los niveles:', questionsError.message);
        return;
      }
  
      // Paso 2: Crear un Set para obtener niveles únicos
      const uniqueLevels = Array.from(new Set(questions.map(q => q.level)));
  
      // Paso 3: Crear un array con los datos a insertar en ProgressTable
      const progressEntries = uniqueLevels.map((level) => ({
        email, // El correo del usuario como referencia
        level_number: level, // El nivel obtenido de QuestionsTable
        completed: false, // Inicialmente los niveles no están completados
      }));
  
      // Paso 4: Insertar los datos en ProgressTable
      const { error: insertError } = await supabase
        .from('ProgressTable')
        .insert(progressEntries);
  
      if (insertError) {
        console.error('Error al llenar ProgressTable:', insertError.message);
      } else {
        console.log('ProgressTable llenada con éxito');
      }
    } catch (error) {
      console.error('Error inesperado:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</Text>

      {isRegistering && (
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
        onPress={isRegistering ? handleRegister : handleLogin}
      />

      <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
        <Text style={styles.switchText}>
          {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </Text>
      </TouchableOpacity>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  switchText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#27613C',
  },
});
