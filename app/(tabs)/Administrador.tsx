import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/database/supabase'; // Importar el cliente de Supabase
import { useFocusEffect } from 'expo-router';

export default function AdminDashboard() {
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState<any>(null); // Estado para almacenar información del usuario

  // Obtener los detalles del usuario logueado y su progreso
  useFocusEffect(
    useCallback(() => {
      fetchUsuario();
      checkSession();
    }, []),
  );

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession(); // Método correcto para obtener la sesión
      if (!session) {
        navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
      }
    } catch {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        navigation.navigate('index'); // Redirigir al login al cerrar sesión
      }
      navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
      return;
    }
  };




  const fetchUsuario = async () => {
    // Paso 1: Obtener la sesión del usuario logueado de forma asincrónica
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Error al obtener la sesión:', sessionError.message);
      return;
    }
    const user = session?.session?.user;
    if (user) {
      // Paso 2: Consultar la tabla Usuario para obtener el nombre
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('name, is_admin')
        .eq('email', user.email)
        .single(); // Usamos single ya que solo esperamos un único resultado
      if (userError) {
        console.error('Error al obtener el nombre del usuario:', userError.message);
        return;
      }
      setUsuario({ email: user.email, name: userData?.name, is_admin: userData?.is_admin });
    }
    // if (usuario.is_admin){
    //   return
    // }
    // else{
    //   navigation.navigate('Panel'); // Navegar a la pantalla de inicio de sesión
    // }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, {usuario?.name}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AdminPreguntas')}
      >
        <Text style={styles.buttonText}>Administrar Preguntas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AdminUsuarios')}
      >
        <Text style={styles.buttonText}>Administrar Usuarios</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AdminReportes')}
      >
        <Text style={styles.buttonText}>Reportes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
