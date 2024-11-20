import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Importamos el hook para la navegación
import { supabase } from '@/database/supabase'; // Importar el cliente de Supabase
import { useFocusEffect } from 'expo-router';

// Definimos una interfaz para los niveles
interface Nivel {
  level_number: number;
  completed: boolean;
}

// Componente principal
export default function Niveles() {
  const [niveles, setNiveles] = useState<Nivel[]>([]); // Estado para almacenar los niveles
  const navigation = useNavigation();


  useFocusEffect(
    useCallback(() => {
      checkSession(); // Verificar si hay una sesión abierta
      fetchNiveles(); // Llamamos a la función para obtener los datos cuando la pantalla está enfocada
    }, []),
  );

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession(); // Método correcto para obtener la sesión
      if (!session) {
        navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
      } else {
        //console.log("Usuario logueado");
        //console.log("Usuario logueado", session);
      }
    } catch {
      navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
      return
    }
  };


  const fetchNiveles = async () => {
    // Obtener el usuario actual usando getUser()
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
      //console.error('Error al obtener el usuario:', userError.message);
      return; // Salimos si hay error
    }

    if (user) {
      // Luego usamos el email del usuario para filtrar los datos
      const { data, error } = await supabase
        .from('ProgressTable') // Aquí obtenemos los niveles de la tabla ProgressTable
        .select('level_number, completed')
        .eq('email', user.email); // Filtramos por el email del usuario actual

      if (error) {
        console.error('Error al obtener los niveles:', error.message);
      } else {
        setNiveles(data || []); // Guardamos los niveles en el estado
      }
    }
  };

  // Hook para cargar los niveles desde Supabase
  useEffect(() => {
    fetchNiveles(); // Llamamos a la función para obtener los datos
  }, []);

  // Función para renderizar cada nivel
  const renderNivel = ({ item }: { item: Nivel }) => {
    const progreso = item.completed ? 1 : 0; // Progreso será 1 si está completado, 0 si no

    return (
      <View style={styles.nivelContainer}>
        <Text style={styles.nivelNombre}>Nivel {item.level_number}</Text>

        {/* Mostrar barra de progreso según plataforma
        {Platform.OS === 'ios' ? (
          <ProgressViewIOS progress={progreso} style={styles.progresoBar} />
        ) : (
          <ProgressBarAndroid styleAttr="Horizontal" progress={progreso} style={styles.progresoBar} />
        )} */}

        <TouchableOpacity
          style={styles.nivelButton}
          onPress={() => navigation.navigate('Desafios', { nivelId: item.level_number })} // Pasamos el número de nivel al componente de desafíos
        // disabled={!item.completed && progreso === 0} // Si no ha sido completado y progreso es 0, se deshabilita
        >
          <Text style={styles.nivelButtonText}>
            {progreso === 1 ? 'Completado' : 'Continuar'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={niveles}
        keyExtractor={(item) => item.level_number.toString()}
        renderItem={renderNivel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  nivelContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  nivelNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#27613C',
  },
  progresoBar: {
    height: 10,
    marginBottom: 10,
  },
  nivelButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  nivelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
