import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '@/database/supabase'; // Asegúrate de que está configurado correctamente
import { useFocusEffect, useNavigation } from 'expo-router';

export default function Trofeos() {

  useFocusEffect(
    useCallback(() => {
      checkSession(); // Verificar si hay una sesión abierta
    }, []),
  );

  const navigation = useNavigation();

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession(); // Método correcto para obtener la sesión
      if (!session) {
        navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
      }
    } catch {
      navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
      return;
    }
  };

  const [trofeos, setTrofeos] = useState([]);
  const [progreso, setProgreso] = useState([]);

  useEffect(() => {
    const fetchProgreso = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error al obtener la sesión:', sessionError.message);
        return;
      }

      const user = session?.user;
      if (user) {
        const { data, error } = await supabase
          .from('ProgressTable')
          .select('level_number, completed')
          .eq('email', user.email);

        if (error) {
          console.error('Error al obtener el progreso:', error.message);
        } else {
          setProgreso(data || []);
        }

        const trofeosAsignados = [];
        if (data.some(nivel => nivel.level_number === 1 && nivel.completed)) {
          trofeosAsignados.push({ id: '1', nombre: 'Trofeo de Bronce', descripcion: 'Obtenido al completar el nivel 1' });
        }
        if (data.some(nivel => nivel.level_number === 2 && nivel.completed)) {
          trofeosAsignados.push({ id: '2', nombre: 'Trofeo de Plata', descripcion: 'Obtenido al completar el nivel 2' });
        }
        if (data.some(nivel => nivel.level_number === 3 && nivel.completed)) {
          trofeosAsignados.push({ id: '3', nombre: 'Trofeo de Oro', descripcion: 'Obtenido al completar el nivel 3' });
        }
        if (data.every(nivel => nivel.completed)) {
          trofeosAsignados.push({ id: '4', nombre: 'Trofeo de Diamante', descripcion: 'Obtenido al completar todos los niveles' });
        }

        setTrofeos(trofeosAsignados);
      }
    };

    fetchProgreso();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.trofeo}>
      <Text style={styles.trofeoNombre}>{item.nombre}</Text>
      <Text style={styles.trofeoDescripcion}>{item.descripcion}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus Trofeos</Text>
      {trofeos.length === 0 ? (
        <Text style={styles.noTrofeos}>No has obtenido trofeos aún.</Text>
      ) : (
        <FlatList
          data={trofeos}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#27613C',
    marginBottom: 20,
  },
  noTrofeos: {
    fontSize: 18,
    color: '#888',
  },
  trofeo: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  trofeoNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27613C',
    marginBottom: 5,
  },
  trofeoDescripcion: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
