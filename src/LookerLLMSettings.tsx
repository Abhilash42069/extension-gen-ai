// Copyright 2023 Google LLC

import React, { useContext, useEffect, useState , FormEvent } from 'react'
import { 
  ComponentsProvider,
  FieldTextArea,
  Space,
  Span,
  SpaceVertical,  
  FieldCheckbox,
  MixedBoolean,
  ComboboxInput,
} from '@looker/components'
import { ExtensionContext , ExtensionContextData } from '@looker/extension-sdk-react'
import { Box, Heading , Combobox, ComboboxOption, ComboboxList, MaybeComboboxOptionObject, Label} from '@looker/components'
import { PromptService, PromptTypeEnum } from './services/PromptService'
import { Logger } from './utils/Logger'


/**
 * A simple component that uses the Looker SDK through the extension sdk to display a customized hello message.
 */
export const LookerLLMSettings: React.FC = () => {
  const { core40SDK } =  useContext(ExtensionContext)
  const [message, setMessage] = useState('')
  const [logLevel, setLogLevel] = useState<string>("error");
  const [usingNativeBQML, setUsingNativeBQML] = useState(true as MixedBoolean)
  const [customPrompt, setCustomPrompt] = useState<string>();

  const storageNativeBQML = "usingNativeBQML";
  const storageLogLevel = "logLevel";
  const storageCustomPrompt = "customPrompt";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Every time it reloads
    const promptService = new PromptService(JSON.parse(window.sessionStorage.getItem(storageCustomPrompt)!));     
    setCustomPrompt(promptService.getPromptTemplateByType(PromptTypeEnum.FIELDS_FILTERS_PIVOTS_SORTS));
    const cStorageNativeBQML = window.sessionStorage.getItem(storageNativeBQML) === "true" || window.sessionStorage.getItem(storageNativeBQML) === null;
    const cStorageLogLevel = window.sessionStorage.getItem(storageLogLevel);
    if(cStorageNativeBQML!= null)
    {      
      setUsingNativeBQML(cStorageNativeBQML);
    }
    if(cStorageLogLevel!=null)
    {
      setLogLevel(cStorageLogLevel);
      Logger.setLogLevel(Logger.getInstance().levelToInt(cStorageLogLevel));
    }    

  }, [])
  
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext);

  const handleChangePrompt = (e: FormEvent<HTMLTextAreaElement>) => {    
    setCustomPrompt(e.currentTarget.value);    
    const tempCustomPrompt: { [key in PromptTypeEnum]?: string } = {
      [PromptTypeEnum.FIELDS_FILTERS_PIVOTS_SORTS]: e.currentTarget.value
    }
    window.sessionStorage.setItem(storageCustomPrompt, JSON.stringify(tempCustomPrompt));       
  }

  const handleChangeCombo= (e: MaybeComboboxOptionObject) => {
    Logger.setLogLevel(Logger.getInstance().levelToInt(e!.value));
    window.sessionStorage.setItem(storageLogLevel, e!.value);
    setLogLevel(e!.value);
    console.log(e!.value);
  }

  return (    
    <ComponentsProvider>
      <Space around>
        <Span fontSize="xxxxxlarge">
          {message}
        </Span>        
      </Space>
      <Space around>
        <Heading fontWeight="semiBold">Looker AI Demo: go/lookerai-llm-demo - Design: go/lookerai-llm</Heading>                        
      </Space>      
      <Box display="flex" m="large">        
          <SpaceVertical>
          <Span fontSize="x-large">
          Extension Settings
          </Span>            
          <Span fontSize="medium">
          Any doubts or feedback or bugs, send it to <b>gricardo@google.com</b> or <b>gimenes@google.com</b>
          </Span>
          <Label>Console Log Level</Label>
          <Combobox  width={"300px"} value={logLevel} onChange={handleChangeCombo}>
            <ComboboxInput />
            <ComboboxList>
              <ComboboxOption value="trace"/>
              <ComboboxOption value="debug" />
              <ComboboxOption value="info" />
              <ComboboxOption value="warn" />
              <ComboboxOption value="error" />
            </ComboboxList>
          </Combobox>

          <FieldCheckbox
            label="Yes - Use Native BQML Method, and No: use Fine tuned model"
            checked={usingNativeBQML}            
            onChange={() => {             
              window.sessionStorage.setItem(storageNativeBQML, usingNativeBQML?"false": "true");
              setUsingNativeBQML(!usingNativeBQML);              
            }}
          />          
          <FieldTextArea            
            width="100%"
            height="500px"
            label="Prompt Field, Filters, Sorts - Template for BQML.GENERATE_TEXT"  
            value={customPrompt}
            onChange={handleChangePrompt}
          />                                         
        </SpaceVertical>                                   
      </Box>

    </ComponentsProvider>
  )
}
